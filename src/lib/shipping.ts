import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";

export type ShippingConfig = {
  feeKrw: number;
  freeThresholdKrw: number;
};

const DEFAULTS: ShippingConfig = {
  feeKrw: 3000,
  freeThresholdKrw: 50000,
};

export async function getShippingConfig(): Promise<ShippingConfig> {
  const rows = await db
    .select()
    .from(settings)
    .where(
      inArray(settings.key, [
        "shipping_fee_krw",
        "free_shipping_threshold_krw",
      ]),
    );

  const map = new Map(rows.map((r) => [r.key, r.value]));
  const parse = (key: string, fallback: number) => {
    const v = map.get(key);
    if (!v) return fallback;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  return {
    feeKrw: parse("shipping_fee_krw", DEFAULTS.feeKrw),
    freeThresholdKrw: parse("free_shipping_threshold_krw", DEFAULTS.freeThresholdKrw),
  };
}

export function calculateShipping(
  itemsKrw: number,
  config: ShippingConfig,
): number {
  if (itemsKrw <= 0) return 0;
  return itemsKrw >= config.freeThresholdKrw ? 0 : config.feeKrw;
}

export async function setShippingConfig(config: ShippingConfig) {
  const entries = [
    { key: "shipping_fee_krw", value: String(Math.floor(config.feeKrw)) },
    {
      key: "free_shipping_threshold_krw",
      value: String(Math.floor(config.freeThresholdKrw)),
    },
  ];

  for (const entry of entries) {
    const existing = await db
      .select()
      .from(settings)
      .where(eq(settings.key, entry.key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ value: entry.value, updatedAt: new Date() })
        .where(eq(settings.key, entry.key));
    } else {
      await db.insert(settings).values(entry);
    }
  }
}
