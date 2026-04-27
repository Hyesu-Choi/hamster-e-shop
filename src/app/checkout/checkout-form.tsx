"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { placeOrder, type CheckoutState } from "./actions";

export function CheckoutForm({
  defaults,
}: {
  defaults?: { shippingName?: string; shippingPhone?: string };
}) {
  const [state, formAction, pending] = useActionState(placeOrder, {});

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="받는 분"
        name="shippingName"
        defaultValue={defaults?.shippingName ?? ""}
        error={state.fieldErrors?.shippingName}
        required
      />
      <Field
        label="연락처"
        name="shippingPhone"
        type="tel"
        placeholder="010-1234-5678"
        defaultValue={defaults?.shippingPhone ?? ""}
        error={state.fieldErrors?.shippingPhone}
        required
      />
      <div className="space-y-2">
        <Label htmlFor="shippingAddress">배송지 주소</Label>
        <textarea
          id="shippingAddress"
          name="shippingAddress"
          rows={2}
          required
          className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm"
          placeholder="도/시/군/구/동, 상세주소"
        />
        {state.fieldErrors?.shippingAddress && (
          <p className="text-destructive text-xs">
            {state.fieldErrors.shippingAddress}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="shippingMemo">배송 메모 (선택)</Label>
        <textarea
          id="shippingMemo"
          name="shippingMemo"
          rows={2}
          className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm"
          placeholder="문 앞에 놓아주세요 등"
        />
      </div>

      {state.error && (
        <p className="text-destructive text-sm">{state.error}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "주문 처리 중..." : "주문하기"}
      </Button>
      <p className="text-muted-foreground text-center text-xs">
        결제 연동은 추후 추가 예정입니다. 현재는 주문서만 생성됩니다.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
