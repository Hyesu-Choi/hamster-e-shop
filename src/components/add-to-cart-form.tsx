"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { Button } from "@/components/ui/button";
import { addToAnonCart } from "@/lib/anonymous-cart";

export function AddToCartForm({
  productId,
  stock,
  isLoggedIn,
}: {
  productId: string;
  stock: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);
  const soldOut = stock <= 0;

  function handleAdd() {
    if (soldOut) return;
    setFeedback(null);

    if (!isLoggedIn) {
      addToAnonCart(productId, quantity, stock);
      setFeedback("✓ 장바구니에 담았어요");
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("quantity", String(quantity));
    startTransition(async () => {
      try {
        await addToCart(formData);
        setFeedback("✓ 장바구니에 담았어요");
        setTimeout(() => setFeedback(null), 2000);
        router.refresh();
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : "오류가 발생했습니다");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {!soldOut && (
        <div className="flex items-center gap-2">
          <span className="text-sm">수량</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="hover:bg-muted size-8 rounded border"
            aria-label="수량 감소"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            className="hover:bg-muted size-8 rounded border"
            aria-label="수량 증가"
          >
            +
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={pending || soldOut}
          className="flex-1"
          onClick={handleAdd}
        >
          {pending ? "처리 중..." : "장바구니 담기"}
        </Button>
      </div>

      {feedback && (
        <p className="text-muted-foreground text-center text-xs">{feedback}</p>
      )}
    </div>
  );
}
