import { pool } from "./db";

export async function reconcile() {
  const internal = await pool.query(`
    SELECT id, amount FROM transactions WHERE status='SUCCESS'
  `);

  for(const tx of internal.rows){
    // simulate provider settled amount
    const providerAmount = tx.amount;

    await pool.query(
      `INSERT INTO provider_settlements (transaction_id, provider_ref, amount, settled_at)
       VALUES ($1,$2,$3,now())`,
      [tx.id, "stripe_"+tx.id, providerAmount]
    );
  }

  const mismatches = await pool.query(`
    SELECT t.id, t.amount, p.amount AS provider_amount
    FROM transactions t
    JOIN provider_settlements p ON t.id=p.transaction_id
    WHERE t.amount <> p.amount
  `);

  return mismatches.rows;
}
