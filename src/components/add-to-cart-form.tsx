"use client";

import { useFormStatus } from "react-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/cart/actions";

function SubmitButton({
  disabled,
  variant,
  children,
}: {
  disabled?: boolean;
  variant?: "default" | "outline";
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      variant={variant}
      disabled={pending || disabled}
      className="flex-1"
    >
      {pending ? "처리 중..." : children}
    </Button>
  );
}

export function AddToCartForm({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const soldOut = stock <= 0;
  const [quantity, setQuantity] = useState(1);

  return (
    <form
      action={addToCart}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />

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
        <SubmitButton disabled={soldOut} variant="outline">
          장바구니 담기
        </SubmitButton>
      </div>
    </form>
  );
}
