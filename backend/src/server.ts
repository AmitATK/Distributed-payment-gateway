import express from "express";
import { pool } from "./db";
import { Queue } from "bullmq";
import { v4 as uuid } from "uuid";
import { webhookQueue } from "./queues";
import { paymentQueue } from "./queues";
import { processRefund } from "./refund";
import { reconcile } from "./reconciliation";
import cors from "cors";

const app = express();
app.use(cors({
    origin: "http://localhost:4200"
}));
app.use(express.json());

const connection = { host: "localhost", port: 6379 };



app.post("/payments", async (req, res) => {
    const apiKey = req.header("X-API-Key");
    const idempotencyKey = req.header("Idempotency-Key");
    const { amount, currency } = req.body;

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const merchant = await client.query(
            "SELECT * FROM merchants WHERE api_key=$1",
            [apiKey]
        );
        if (!merchant.rows.length) return res.status(401).send("Invalid API Key");

        const m = merchant.rows[0];

        // Idempotency check
        const existing = await client.query(
            "SELECT * FROM transactions WHERE merchant_id=$1 AND idempotency_key=$2",
            [m.id, idempotencyKey]
        );
        if (existing.rows.length) {
            await client.query("COMMIT");
            return res.json(existing.rows[0]);
        }

        const tx = await client.query(
            `INSERT INTO transactions (merchant_id, amount, currency, status, idempotency_key)
       VALUES ($1,$2,$3,'PROCESSING',$4) RETURNING *`,
            [m.id, amount, currency, idempotencyKey]
        );

        await paymentQueue.add("process", { transactionId: tx.rows[0].id });
        await webhookQueue.add("send", {
            merchantId: tx.rows[0].merchant_id,
            transactionId: tx.rows[0].id
        });

        await client.query("COMMIT");
        res.json(tx.rows[0]);

    } catch (e) {
        await client.query("ROLLBACK");
        res.status(500).send("Error");
    } finally {
        client.release();
    }
});
app.post("/admin/replay-webhook/:jobId", async (req, res) => {
    const job = await webhookQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).send("Job not found");

    await job.retry();
    res.send("Replayed");
});

app.get("/admin/webhooks/failed", async (req, res) => {
    const failed = await webhookQueue.getFailed();
    res.json(failed.map(j => ({
        jobId: j.id,
        transactionId: j.data.transactionId,
        attempts: j.attemptsMade,
        failedReason: j.failedReason
    })));
});

app.post("/admin/webhooks/replay/:jobId", async (req, res) => {
    const job = await webhookQueue.getJob(req.params.jobId);
    if (!job) return res.status(404).send("Not found");

    await job.retry();
    res.send("Replayed");
});

app.get("/admin/webhooks/stats", async (req, res) => {
    const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status='SUCCESS') AS success,
      COUNT(*) FILTER (WHERE status='FAILED') AS failed
    FROM webhook_deliveries
  `);
    res.json(result.rows[0]);
});

app.get("/admin/payments/stats", async (req, res) => {
    const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status='SUCCESS') AS success,
      COUNT(*) FILTER (WHERE status='FAILED') AS failed,
      SUM(amount) FILTER (WHERE status='SUCCESS') AS total_volume
    FROM transactions
  `);
    res.json(result.rows[0]);
});

app.post("/admin/refund/:txId", async (req, res) => {
    try {
        await processRefund(req.params.txId, req.body.amount);
        res.send("Refunded");
    } catch (e) {
        res.status(400).send((e as Error).message);
    }
});


app.get("/admin/reconcile", async (req, res) => {
    const mismatches = await reconcile();
    res.json({ mismatches });
});

app.get("/admin/revenue/timeline", async (req, res) => {
    const result = await pool.query(`
    SELECT
      to_char(created_at,'YYYY-MM-DD') as day,
      SUM(amount) as revenue
    FROM transactions
    WHERE status='SUCCESS'
    GROUP BY day
    ORDER BY day
  `);
    res.json(result.rows);
});


app.listen(3000, () => console.log("API running on 3000"));
