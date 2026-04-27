"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  cancellationRequests,
  orderItems,
  orders,
  products,
} from "@/lib/db/schema";

export type OrderUserActionState = {
  error?: string;
  success?: string;
};

export async function cancelPendingOrder(
  _prev: OrderUserActionState,
  formData: FormData,
): Promise<OrderUserActionState> {
  const user = await requireUser();
  const orderId = formData.get("orderId")?.toString();
  if (!orderId) return { error: "주문 ID가 없습니다" };

  try {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, user.id)))
        .limit(1);
      if (!order) throw new Error("주문을 찾을 수 없습니다");
      if (order.status !== "pending") {
        throw new Error("결제 완료된 주문은 직접 취소할 수 없습니다");
      }

      const items = await tx
        .select({
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));

      for (const item of items) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      await tx
        .update(orders)
        .set({ status: "cancelled" })
        .where(eq(orders.id, orderId));
    });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "취소 실패" };
  }

  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { success: "주문이 취소되었습니다" };
}

const requestSchema = z.object({
  orderId: z.uuid(),
  reason: z.string().min(2, "취소 사유를 적어주세요").max(500),
});

export async function requestCancellation(
  _prev: OrderUserActionState,
  formData: FormData,
): Promise<OrderUserActionState> {
  const user = await requireUser();
  const parsed = requestSchema.safeParse({
    orderId: formData.get("orderId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, parsed.data.orderId), eq(orders.userId, user.id)))
    .limit(1);
  if (!order) return { error: "주문을 찾을 수 없습니다" };
  if (order.status === "cancelled") {
    return { error: "이미 취소된 주문입니다" };
  }
  if (order.status === "shipped" || order.status === "delivered") {
    return { error: "배송 단계에서는 반품으로 처리해주세요" };
  }

  const [existing] = await db
    .select()
    .from(cancellationRequests)
    .where(
      and(
        eq(cancellationRequests.orderId, parsed.data.orderId),
        eq(cancellationRequests.status, "requested"),
      ),
    )
    .limit(1);
  if (existing) return { error: "이미 취소 요청이 접수되었습니다" };

  await db.insert(cancellationRequests).values({
    orderId: parsed.data.orderId,
    requestedBy: user.id,
    reason: parsed.data.reason,
  });

  revalidatePath(`/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/cancellations");
  return { success: "취소 요청이 접수되었습니다" };
}
