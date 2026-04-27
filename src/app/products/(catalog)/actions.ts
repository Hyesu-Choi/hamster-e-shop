"use server";

import {
  getProducts,
  type ProductCursor,
  type ProductFilter,
  type ProductPage,
} from "@/lib/db/queries";

export async function loadMoreProducts(
  filter: ProductFilter,
  cursor: ProductCursor,
): Promise<ProductPage> {
  return getProducts(filter, { cursor });
}
