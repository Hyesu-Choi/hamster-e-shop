"use client";

import { useEffect, useState } from "react";

const KEY = "mochiham_cart_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const EVENT_NAME = "mochiham:anon-cart-change";

export type AnonCartItem = {
  productId: string;
  quantity: number;
  addedAt: number;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readAnonCart(): AnonCartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AnonCartItem[];
    const cutoff = Date.now() - TTL_MS;
    return parsed.filter(
      (i) =>
        i &&
        typeof i.productId === "string" &&
        typeof i.quantity === "number" &&
        i.quantity > 0 &&
        i.addedAt > cutoff,
    );
  } catch {
    return [];
  }
}

function writeAnonCart(items: AnonCartItem[]) {
  if (!isBrowser()) return;
  if (items.length === 0) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function addToAnonCart(
  productId: string,
  quantity: number,
  maxStock: number,
) {
  const items = readAnonCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, maxStock);
  } else {
    items.push({
      productId,
      quantity: Math.min(quantity, maxStock),
      addedAt: Date.now(),
    });
  }
  writeAnonCart(items);
}

export function updateAnonCartQuantity(productId: string, quantity: number) {
  const items = readAnonCart().map((i) =>
    i.productId === productId ? { ...i, quantity } : i,
  );
  writeAnonCart(items);
}

export function removeFromAnonCart(productId: string) {
  writeAnonCart(readAnonCart().filter((i) => i.productId !== productId));
}

export function clearAnonCart() {
  writeAnonCart([]);
}

export function useAnonCart() {
  const [items, setItems] = useState<AnonCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readAnonCart());
    sync();
    setHydrated(true);
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const totalCount = items.reduce((n, i) => n + i.quantity, 0);
  return { items, totalCount, hydrated };
}
