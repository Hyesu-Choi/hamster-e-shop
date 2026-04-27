"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  resolveAnonCart,
  type AnonCartLineItem,
} from "@/app/cart/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  removeFromAnonCart,
  updateAnonCartQuantity,
  useAnonCart,
} from "@/lib/anonymous-cart";
import { formatKrw } from "@/lib/format";

export function AnonymousCartView() {
  const { items, hydrated } = useAnonCart();
  const [lines, setLines] = useState<AnonCartLineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (items.length === 0) {
      setLines([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    resolveAnonCart(items).then((result) => {
      if (!cancelled) {
        setLines(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [items, hydrated]);

  if (!hydrated || loading) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-6 py-20 text-center">
        <p className="text-muted-foreground">불러오는 중...</p>
      </main>
    );
  }

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-6 py-20 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold">장바구니가 비어있어요</h1>
        <p className="text-muted-foreground mt-2">
          마음에 드는 상품을 담아보세요.
        </p>
        <Button
          className="mt-6"
          size="lg"
          nativeButton={false}
          render={<Link href="/products" />}
        >
          상품 둘러보기
        </Button>
      </main>
    );
  }

  const subtotal = lines.reduce(
    (sum, l) => sum + l.product.priceKrw * l.quantity,
    0,
  );

  return (
    <main className="mx-auto grid max-w-5xl flex-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
      <section>
        <h1 className="mb-2 text-2xl font-bold">장바구니 ({lines.length})</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          로그인하면 장바구니가 안전하게 보관됩니다.
        </p>
        <ul className="space-y-3">
          {lines.map((line) => (
            <li key={line.cartKey}>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Link
                    href={`/products/${line.product.slug}`}
                    className="bg-muted flex size-20 shrink-0 items-center justify-center rounded text-3xl"
                  >
                    {line.product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.product.imageUrl}
                        alt={line.product.name}
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      "🐹"
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${line.product.slug}`}
                      className="line-clamp-1 font-medium hover:underline"
                    >
                      {line.product.name}
                    </Link>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {formatKrw(line.product.priceKrw)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <label
                        htmlFor={`qty-${line.cartKey}`}
                        className="text-muted-foreground text-xs"
                      >
                        수량
                      </label>
                      <select
                        id={`qty-${line.cartKey}`}
                        value={line.quantity}
                        onChange={(e) =>
                          updateAnonCartQuantity(
                            line.product.id,
                            Number(e.target.value),
                          )
                        }
                        className="rounded border px-2 py-1 text-sm"
                      >
                        {Array.from(
                          { length: Math.min(line.product.stock, 10) },
                          (_, i) => i + 1,
                        ).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">
                      {formatKrw(line.product.priceKrw * line.quantity)}
                    </p>
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => removeFromAnonCart(line.product.id)}
                    >
                      삭제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">주문 요약</h2>
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>상품 합계</span>
              <span>{formatKrw(subtotal)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>배송비</span>
              <span>주문 시 계산</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>예상 결제 금액</span>
              <span>{formatKrw(subtotal)}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              nativeButton={false}
              render={<Link href="/login?next=/cart" />}
            >
              로그인하고 주문하기
            </Button>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
