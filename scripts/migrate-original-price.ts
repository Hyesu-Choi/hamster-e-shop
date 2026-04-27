import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = postgres(url, { prepare: false, max: 1 });

await sql.unsafe(`
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price_krw integer;
`);

console.log("✅ original_price_krw column added");
await sql.end();
process.exit(0);
