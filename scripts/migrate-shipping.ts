import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = postgres(url, { prepare: false, max: 1 });

await sql.unsafe(`
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_krw integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_krw integer NOT NULL DEFAULT 0;

INSERT INTO settings (key, value)
  VALUES ('shipping_fee_krw', '3000'), ('free_shipping_threshold_krw', '50000')
  ON CONFLICT (key) DO NOTHING;
`);

const rows = await sql`SELECT key, value FROM settings ORDER BY key`;
console.log("✅ shipping settings ready:", rows);
await sql.end();
process.exit(0);
