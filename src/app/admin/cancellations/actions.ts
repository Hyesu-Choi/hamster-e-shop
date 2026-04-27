"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  cancellationRequests,
  orderItems,
  orders,
  products,
} from "@/lib/db/schema";

const resolveSchema = z.object({
  requestId: z.uuid(),
  adminNote: z.string().max(500).optional(),
});

export async function approveCancellation(formData: FormData) {
  await requireAdmin();
  const parsed = resolveSchema.parse({
    requestId: formData.get("requestId"),
    adminNote: formData.get("adminNote")?.toString() || undefined,
  });

  await db.transaction(async (tx) => {
    const [request] = await tx
      .select()
      .from(cancellationRequests)
      .where(eq(cancellationRequests.id, parsed.requestId))
      .limit(1);
    if (!request || request.status !== "requested") return;

    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.id, request.orderId))
      .limit(1);
    if (!order) return;

    const items = await tx
      .select({
        productId: orderItems.productId,
        quantity: orderItems.quantity,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, request.orderId));

    for (const item of items) {
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} + ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }

    await tx
      .update(orders)
      .set({ status: "cancelled" })
      .where(eq(orders.id, request.orderId));

    await tx
      .update(cancellationRequests)
      .set({
        status: "approved",
        adminNote: parsed.adminNote ?? null,
        resolvedAt: new Date(),
      })
      .where(eq(cancellationRequests.id, parsed.requestId));
  });

  revalidatePath("/admin/cancellations");
  revalidatePath("/admin/orders");
  revalidatePath(`/orders/${parsed.requestId}`);
}

export async function rejectCancellation(formData: FormData) {
  await requireAdmin();
  const parsed = resolveSchema.parse({
    requestId: formData.get("requestId"),
    adminNote: formData.get("adminNote")?.toString() || undefined,
  });

  await db
    .update(cancellationRequests)
    .set({
      status: "rejected",
      adminNote: parsed.adminNote ?? null,
      resolvedAt: new Date(),
    })
    .where(eq(cancellationRequests.id, parsed.requestId));

  revalidatePath("/admin/cancellations");
}
