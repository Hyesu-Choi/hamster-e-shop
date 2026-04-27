"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";

const addSchema = z.object({
  productId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

const updateSchema = z.object({
  itemId: z.uuid(),
  quantity: z.coerce.number().int().min(1).max(99),
});

const removeSchema = z.object({
  itemId: z.uuid(),
});

export async function addToCart(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/cart");
  }

  const parsed = addSchema.parse({
    productId: formData.get("productId"),
    quantity: formData.get("quantity"),
  });

  const [product] = await db
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, parsed.productId))
    .limit(1);

  if (!product || product.stock <= 0) {
    throw new Error("재고가 없습니다");
  }

  const [existing] = await db
    .select()
    .from(cartItems)
    .where(
      and(
        eq(cartItems.userId, user.id),
        eq(cartItems.productId, parsed.productId),
      ),
    )
    .limit(1);

  if (existing) {
    const newQty = Math.min(existing.quantity + parsed.quantity, product.stock);
    await db
      .update(cartItems)
      .set({ quantity: newQty })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      userId: user.id,
      productId: parsed.productId,
      quantity: Math.min(parsed.quantity, product.stock),
    });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function updateCartQuantity(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = updateSchema.parse({
    itemId: formData.get("itemId"),
    quantity: formData.get("quantity"),
  });

  await db
    .update(cartItems)
    .set({ quantity: parsed.quantity })
    .where(
      and(eq(cartItems.id, parsed.itemId), eq(cartItems.userId, user.id)),
    );

  revalidatePath("/cart");
}

export async function removeFromCart(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = removeSchema.parse({ itemId: formData.get("itemId") });

  await db
    .delete(cartItems)
    .where(
      and(eq(cartItems.id, parsed.itemId), eq(cartItems.userId, user.id)),
    );

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function getCartCount(userId: string) {
  const [row] = await db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
    .from(cartItems)
    .where(eq(cartItems.userId, userId));
  return row?.count ?? 0;
}
