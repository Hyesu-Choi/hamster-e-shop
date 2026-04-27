import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "./index";
import {
  cancellationRequests,
  cartItems,
  categories,
  notices,
  orderItems,
  orders,
  productImages,
  products,
  users,
} from "./schema";

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export type ProductFilter = {
  category?: string;
  q?: string;
};

export async function getProducts(filter: ProductFilter = {}) {
  const conditions: SQL[] = [eq(products.isPublished, true)];

  if (filter.category) {
    conditions.push(eq(categories.slug, filter.category));
  }

  if (filter.q && filter.q.trim().length > 0) {
    const term = `%${filter.q.trim()}%`;
    const matchTerm = or(
      ilike(products.name, term),
      ilike(products.description, term),
    );
    if (matchTerm) conditions.push(matchTerm);
  }

  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      priceKrw: products.priceKrw,
      originalPriceKrw: products.originalPriceKrw,
      stock: products.stock,
      imageUrl: products.imageUrl,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(products.createdAt));
}

export async function getFeaturedProducts(limit = 8) {
  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      priceKrw: products.priceKrw,
      originalPriceKrw: products.originalPriceKrw,
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

export async function getActiveCancellationRequest(orderId: string) {
  const [row] = await db
    .select()
    .from(cancellationRequests)
    .where(
      and(
        eq(cancellationRequests.orderId, orderId),
        eq(cancellationRequests.status, "requested"),
      ),
    )
    .orderBy(desc(cancellationRequests.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getCancellationQueue() {
  return db
    .select({
      id: cancellationRequests.id,
      orderId: cancellationRequests.orderId,
      reason: cancellationRequests.reason,
      status: cancellationRequests.status,
      createdAt: cancellationRequests.createdAt,
      buyerEmail: users.email,
      orderTotal: orders.totalKrw,
      orderStatus: orders.status,
    })
    .from(cancellationRequests)
    .leftJoin(orders, eq(cancellationRequests.orderId, orders.id))
    .leftJoin(users, eq(cancellationRequests.requestedBy, users.id))
    .where(eq(cancellationRequests.status, "requested"))
    .orderBy(desc(cancellationRequests.createdAt));
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
      originalPriceKrw: products.originalPriceKrw,
      stock: products.stock,
      imageUrl: products.imageUrl,
      categorySlug: categories.slug,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.isPublished, true)))
    .limit(1);

  if (!row) return null;

  const extras = await db
    .select({
      id: productImages.id,
      url: productImages.url,
      alt: productImages.alt,
    })
    .from(productImages)
    .where(eq(productImages.productId, row.id))
    .orderBy(productImages.position, productImages.createdAt);

  const images: { id: string; url: string; alt: string | null }[] = [];
  if (row.imageUrl) {
    images.push({ id: "primary", url: row.imageUrl, alt: row.name });
  }
  for (const e of extras) images.push(e);

  return { ...row, images };
}

export async function getProductImages(productId: string) {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(productImages.position, productImages.createdAt);
}
