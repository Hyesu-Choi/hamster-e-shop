"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import {
  type ProductCursor,
  type ProductFilter,
  type ProductListItem,
} from "@/lib/db/queries";
import { loadMoreProducts } from "./actions";

export function ProductsInfiniteList({
  initialItems,
  initialCursor,
  filter,
  filterKey,
}: {
  initialItems: ProductListItem[];
  initialCursor: ProductCursor | null;
  filter: ProductFilter;
  filterKey: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState<ProductCursor | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when filter changes (server returns new initial data)
  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setError(null);
  }, [initialItems, initialCursor, filterKey]);

  useEffect(() => {
    if (!cursor) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || loading) continue;
          setLoading(true);
          setError(null);
          loadMoreProducts(filter, cursor)
            .then((page) => {
              setItems((prev) => {
                const seen = new Set(prev.map((p) => p.id));
                return [
                  ...prev,
                  ...page.items.filter((p) => !seen.has(p.id)),
                ];
              });
              setCursor(page.nextCursor);
            })
            .catch((err) => {
              setError(err instanceof Error ? err.message : "불러오기 실패");
            })
            .finally(() => setLoading(false));
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, filter, loading]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {cursor && (
        <div
          ref={sentinelRef}
          className="text-muted-foreground py-8 text-center text-xs"
        >
          {loading ? "불러오는 중..." : "스크롤하여 더 보기"}
        </div>
      )}

      {error && (
        <p className="text-destructive py-4 text-center text-sm">{error}</p>
      )}
    </>
  );
}
