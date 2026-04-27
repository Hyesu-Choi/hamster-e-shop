"use client";

import { useActionState, useState } from "react";
import {
  cancelPendingOrder,
  requestCancellation,
  type OrderUserActionState,
} from "./actions";
import { Button } from "@/components/ui/button";

const initial: OrderUserActionState = {};

export function CancelPendingButton({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(
    cancelPendingOrder,
    initial,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("주문을 취소하시겠습니까? 재고가 복구됩니다.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <Button
        type="submit"
        variant="destructive"
        size="sm"
        disabled={pending}
      >
        {pending ? "취소 중..." : "주문 취소"}
      </Button>
      {state.error && (
        <p className="text-destructive mt-2 text-xs">{state.error}</p>
      )}
    </form>
  );
}

export function RequestCancellationForm({
  orderId,
  alreadyRequested,
}: {
  orderId: string;
  alreadyRequested: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    requestCancellation,
    initial,
  );
  const [open, setOpen] = useState(false);

  if (alreadyRequested) {
    return (
      <p className="text-muted-foreground text-sm">
        ⏳ 취소 요청이 접수되었습니다. 어드민 검토 후 처리됩니다.
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
      >
        취소 요청
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <textarea
        name="reason"
        rows={3}
        required
        placeholder="취소 사유를 적어주세요 (예: 단순 변심)"
        className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm"
      />
      {state.error && (
        <p className="text-destructive text-xs">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-700">{state.success}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="destructive" disabled={pending}>
          {pending ? "전송 중..." : "요청 보내기"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
