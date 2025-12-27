import { Worker } from "bullmq";
import { pool } from "./db";
import { webhookQueue } from "./queues";
import { redis } from "./redis";

const connection = {
  host: "localhost",
  port: 6379
};

new Worker(
  "payments",
  async job => {
    const { transactionId } = job.data;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const tx = await client.query(
        "SELECT * FROM transactions WHERE id=$1",
        [transactionId]
      );

      const amount = Number(tx.rows[0].amount);

      const merchantAccount = await client.query(
        "SELECT * FROM accounts WHERE merchant_id=$1 AND type='merchant'",
        [tx.rows[0].merchant_id]
      );

      const platformAccount = await client.query(
        "SELECT * FROM accounts WHERE merchant_id=$1 AND type='platform'",
        [tx.rows[0].merchant_id]
      );

      const fee = amount * 0.02;
      const merchantGets = amount - fee;

      // Credit merchant
      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount)
         VALUES ($1,$2,'CREDIT',$3)`,
        [transactionId, merchantAccount.rows[0].id, merchantGets]
      );

      // Credit platform
      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount)
         VALUES ($1,$2,'CREDIT',$3)`,
        [transactionId, platformAccount.rows[0].id, fee]
      );

      await client.query(
        "UPDATE transactions SET status='SUCCESS' WHERE id=$1",
        [transactionId]
      );

      await client.query(
        `INSERT INTO payment_events (transaction_id,event_type,payload)
   VALUES ($1,'PAYMENT_SUCCESS',$2)`,
        [transactionId, { amount }]
      );


      await client.query("COMMIT");
      await webhookQueue.add("send-webhook", {
        transactionId
      }, {
        attempts: 5,
        backoff: { type: "exponential", delay: 3000 }
      });

      console.log("Payment processed:", transactionId);
    } catch (e) {
      await client.query("ROLLBACK");
      console.error("Worker error", e);
    }
    finally {
      client.release();
    }
  },
  {
    connection: redis
  }
);
