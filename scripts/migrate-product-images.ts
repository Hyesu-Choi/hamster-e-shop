import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = postgres(url, { prepare: false, max: 1 });

await sql.unsafe(`
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON product_images(product_id);
`);

const [{ count }] = await sql<{ count: number }[]>`
  SELECT COUNT(*)::int AS count FROM product_images
`;
console.log("✅ product_images table ready, rows:", count);
await sql.end();
process.exit(0);
