import { Worker } from "bullmq";
import fetch from "node-fetch";
import { pool } from "./db";
import { signPayload } from "./webhookSigner";
import { redis } from "./redis";

new Worker(
  "webhooks",
  async job => {
    const { transactionId } = job.data;

    const tx = await pool.query(`
      SELECT t.*, m.webhook_url, m.webhook_secret
      FROM transactions t
      JOIN merchants m ON t.merchant_id=m.id
      WHERE t.id=$1
    `, [transactionId]);

    const data = tx.rows[0];

    const payload = JSON.stringify({
      transactionId,
      amount: data.amount,
      status: data.status
    });

    const signature = signPayload(payload, data.webhook_secret);

    const res = await fetch(data.webhook_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature
      },
      body: payload
    });

    if (!res.ok) {
      await pool.query(`
    INSERT INTO webhook_deliveries (transaction_id, merchant_id, status, attempts, last_error)
    VALUES ($1,$2,'FAILED',$3,$4)
  `, [transactionId, data.merchant_id, job.attemptsMade + 1, "HTTP " + res.status]);

      throw new Error("Webhook delivery failed");
    }

    await pool.query(`
  INSERT INTO webhook_deliveries (transaction_id, merchant_id, status, attempts)
  VALUES ($1,$2,'SUCCESS',$3)
`, [transactionId, data.merchant_id, job.attemptsMade + 1]);

    console.log("Webhook delivered for", transactionId);

  },
  {
    connection: redis
  }
);
