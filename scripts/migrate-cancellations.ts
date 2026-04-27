import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const sql = postgres(url, { prepare: false, max: 1 });

await sql.unsafe(`
DO $$ BEGIN
  CREATE TYPE cancellation_status AS ENUM ('requested', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS cancellation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason text NOT NULL,
  status cancellation_status NOT NULL DEFAULT 'requested',
  admin_note text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  resolved_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS cancellation_requests_status_idx ON cancellation_requests(status);
CREATE INDEX IF NOT EXISTS cancellation_requests_order_id_idx ON cancellation_requests(order_id);
`);

console.log("✅ cancellation_requests table ready");
await sql.end();
process.exit(0);
