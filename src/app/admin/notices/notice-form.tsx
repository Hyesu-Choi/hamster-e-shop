"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type NoticeFormState } from "./actions";

export type NoticeDefaults = {
  title?: string;
  content?: string;
  isPinned?: boolean;
  isPublished?: boolean;
};

export function NoticeForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (
    state: NoticeFormState,
    formData: FormData,
  ) => Promise<NoticeFormState>;
  defaults?: NoticeDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaults?.title ?? ""}
          required
          placeholder="설 연휴 배송 일정 안내"
        />
        {state.fieldErrors?.title && (
          <p className="text-destructive text-xs">{state.fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <textarea
          id="content"
          name="content"
          defaultValue={defaults?.content ?? ""}
          rows={10}
          required
          className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm"
          placeholder="줄바꿈 그대로 표시됩니다."
        />
        {state.fieldErrors?.content && (
          <p className="text-destructive text-xs">
            {state.fieldErrors.content}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPinned"
          defaultChecked={defaults?.isPinned ?? false}
        />
        상단 배너에 고정
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={defaults?.isPublished ?? true}
        />
        공개
      </label>

      {state.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
