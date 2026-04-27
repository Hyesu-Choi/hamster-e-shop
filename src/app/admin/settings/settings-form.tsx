"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateShippingSettings,
  type SettingsFormState,
} from "./actions";

export function SettingsForm({
  defaults,
}: {
  defaults: { feeKrw: number; freeThresholdKrw: number };
}) {
  const [state, formAction, pending] = useActionState<
    SettingsFormState,
    FormData
  >(updateShippingSettings, {});

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div className="space-y-2">
        <Label htmlFor="feeKrw">기본 배송비 (원)</Label>
        <Input
          id="feeKrw"
          name="feeKrw"
          type="number"
          min={0}
          defaultValue={defaults.feeKrw}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="freeThresholdKrw">무료배송 시작 금액 (원)</Label>
        <Input
          id="freeThresholdKrw"
          name="freeThresholdKrw"
          type="number"
          min={0}
          defaultValue={defaults.freeThresholdKrw}
          required
        />
      </div>
      {state.error && <p className="text-destructive text-sm">{state.error}</p>}
      {state.saved && (
        <p className="text-sm text-green-700">✓ 저장되었습니다</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
