"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { mergeAnonymousCart } from "@/app/cart/actions";
import { clearAnonCart, readAnonCart } from "@/lib/anonymous-cart";

export function CartMerger({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || ran.current) return;
    ran.current = true;
    const items = readAnonCart();
    if (items.length === 0) return;

    mergeAnonymousCart(
      items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    )
      .then(({ merged }) => {
        if (merged > 0) {
          clearAnonCart();
          router.refresh();
        }
      })
      .catch(() => {
        // ignore — user can retry by visiting cart
      });
  }, [isLoggedIn, router]);

  return null;
}
