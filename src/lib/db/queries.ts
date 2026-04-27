import { and, desc, eq } from "drizzle-orm";
import { db } from "./index";
import {
  cartItems,
  categories,
  notices,
  orderItems,
  orders,
  products,
} from "./schema";

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function getProducts(categorySlug?: string) {
  const where = categorySlug
    ? and(
        eq(products.isPublished, true),
        eq(categories.slug, categorySlug),
      )
    : eq(products.isPublished, true);

  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      priceKrw: products.priceKrw,
      stock: products.stock,
      imageUrl: products.imageUrl,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(where)
    .orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts(limit = 8) {
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      priceKrw: products.priceKrw,
      stock: products.stock,
      imageUrl: products.imageUrl,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isPublished, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getCartItems(userId: string) {
  return db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: {
        id: products.id,
        slug: products.slug,
        name: products.name,
        priceKrw: products.priceKrw,
        stock: products.stock,
        imageUrl: products.imageUrl,
      },
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, userId))
    .orderBy(desc(cartItems.createdAt));
}

export async function getPublishedNotices() {
  return db
    .select()
    .from(notices)
    .where(eq(notices.isPublished, true))
    .orderBy(desc(notices.isPinned), desc(notices.createdAt));
}

export async function getNoticeById(id: string) {
  const [row] = await db
    .select()
    .from(notices)
    .where(and(eq(notices.id, id), eq(notices.isPublished, true)))
    .limit(1);
  return row ?? null;
}

export async function getPinnedNotice() {
  const [row] = await db
    .select()
    .from(notices)
    .where(and(eq(notices.isPinned, true), eq(notices.isPublished, true)))
    .orderBy(desc(notices.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getUserOrders(userId: string) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(orderId: string, userId?: string) {
  const where = userId
    ? and(eq(orders.id, orderId), eq(orders.userId, userId))
    : eq(orders.id, orderId);

  const [order] = await db.select().from(orders).where(where).limit(1);
  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      productName: orderItems.productName,
      unitPriceKrw: orderItems.unitPriceKrw,
      quantity: orderItems.quantity,
      productSlug: products.slug,
      imageUrl: products.imageUrl,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  return { order, items };
}

export async function getProductBySlug(slug: string) {
  const [row] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      priceKrw: products.priceKrw,
      stock: products.stock,
      imageUrl: products.imageUrl,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isPublished, true)))
    .limit(1);

  return row;
}
