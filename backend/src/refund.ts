import { pool } from "./db";

export async function processRefund(transactionId:string, amount:number) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tx = await client.query(
      "SELECT * FROM transactions WHERE id=$1",
      [transactionId]
    );

    if(tx.rows[0].status !== "SUCCESS")
      throw new Error("Cannot refund");

    await client.query(
      "INSERT INTO refunds (transaction_id, amount, status) VALUES ($1,$2,'SUCCESS')",
      [transactionId, amount]
    );

    // Reverse ledger (money goes back)
    const entries = await client.query(
      "SELECT * FROM ledger_entries WHERE transaction_id=$1",
      [transactionId]
    );

    for(const e of entries.rows){
      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id, entry_type, amount)
         VALUES ($1,$2,$3,$4)`,
        [transactionId, e.account_id, e.entry_type === "CREDIT" ? "DEBIT":"CREDIT", e.amount]
      );
    }

    await client.query("COMMIT");
  } catch(e){
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
