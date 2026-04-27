"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  cartItems,
  orderItems,
  orders,
  products,
} from "@/lib/db/schema";

const schema = z.object({
  shippingName: z.string().min(1, "받는 분 이름을 입력하세요").max(50),
  shippingPhone: z
    .string()
    .regex(/^[\d\-+\s()]+$/, "전화번호 형식이 올바르지 않습니다")
    .min(8)
    .max(20),
  shippingAddress: z.string().min(5, "배송지를 입력하세요").max(500),
  shippingMemo: z.string().max(500).optional(),
});

export type CheckoutState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const user = await requireUser();

  const parsed = schema.safeParse({
    shippingName: formData.get("shippingName"),
    shippingPhone: formData.get("shippingPhone"),
    shippingAddress: formData.get("shippingAddress"),
    shippingMemo: formData.get("shippingMemo") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) {
      fieldErrors[i.path.join(".")] = i.message;
    }
    return { fieldErrors };
  }

  let createdOrderId: string | null = null;

  try {
    await db.transaction(async (tx) => {
      const items = await tx
        .select({
          id: cartItems.id,
          quantity: cartItems.quantity,
          productId: products.id,
          productName: products.name,
          priceKrw: products.priceKrw,
          stock: products.stock,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.userId, user.id));

      if (items.length === 0) {
        throw new Error("장바구니가 비어있습니다");
      }

      for (const item of items) {
        if (item.stock < item.quantity) {
          throw new Error(`재고가 부족한 상품이 있습니다: ${item.productName}`);
        }
      }

      const total = items.reduce(
        (sum, i) => sum + i.priceKrw * i.quantity,
        0,
      );

      const [order] = await tx
        .insert(orders)
        .values({
          userId: user.id,
          totalKrw: total,
          status: "pending",
          shippingName: parsed.data.shippingName,
          shippingPhone: parsed.data.shippingPhone,
          shippingAddress: parsed.data.shippingAddress,
          shippingMemo: parsed.data.shippingMemo ?? null,
        })
        .returning({ id: orders.id });

      await tx.insert(orderItems).values(
        items.map((i) => ({
          orderId: order.id,
          productId: i.productId,
          productName: i.productName,
          unitPriceKrw: i.priceKrw,
          quantity: i.quantity,
        })),
      );

      for (const item of items) {
        await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      await tx.delete(cartItems).where(eq(cartItems.userId, user.id));

      createdOrderId = order.id;
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "주문 생성에 실패했습니다",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/orders/${createdOrderId}?placed=1`);
}
