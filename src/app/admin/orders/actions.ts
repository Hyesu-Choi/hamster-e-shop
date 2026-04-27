"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { ORDER_STATUS_VALUES } from "@/lib/order-status";

const schema = z.object({
  orderId: z.uuid(),
  status: z.enum(ORDER_STATUS_VALUES as [string, ...string[]]),
});

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const parsed = schema.parse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  await db
    .update(orders)
    .set({ status: parsed.status as (typeof ORDER_STATUS_VALUES)[number] })
    .where(eq(orders.id, parsed.orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.orderId}`);
  revalidatePath(`/orders/${parsed.orderId}`);
}
