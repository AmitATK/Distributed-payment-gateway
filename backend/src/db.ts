import { Pool } from "pg";

export const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postgres",
  database: "payment_platform",
  port: 5432
});
