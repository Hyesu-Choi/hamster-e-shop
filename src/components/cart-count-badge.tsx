"use client";

import { useAnonCart } from "@/lib/anonymous-cart";

export function AnonCartCountBadge() {
  const { totalCount, hydrated } = useAnonCart();
  if (!hydrated || totalCount === 0) return null;
  return (
    <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
      {totalCount}
    </span>
  );
}
