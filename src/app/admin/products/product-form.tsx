"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ProductFormState } from "./actions";
import { ImageUploadField } from "./image-upload-field";

type Category = { id: string; name: string };

export type ProductDefaults = {
  slug?: string;
  name?: string;
  description?: string | null;
  priceKrw?: number;
  stock?: number;
  imageUrl?: string | null;
  categoryId?: string | null;
  isPublished?: boolean;
};

export function ProductForm({
  action,
  defaults,
  categories,
  submitLabel,
}: {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  defaults?: ProductDefaults;
  categories: Category[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-xl space-y-4">
      <Field
        label="슬러그 (URL)"
        name="slug"
        defaultValue={defaults?.slug}
        error={state.fieldErrors?.slug}
        placeholder="premium-hamster-mix"
        required
      />
      <Field
        label="상품명"
        name="name"
        defaultValue={defaults?.name}
        error={state.fieldErrors?.name}
        required
      />
      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <textarea
          id="description"
          name="description"
          defaultValue={defaults?.description ?? ""}
          rows={4}
          className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="가격 (원)"
          name="priceKrw"
          type="number"
          min={0}
          defaultValue={defaults?.priceKrw}
          error={state.fieldErrors?.priceKrw}
          required
        />
        <Field
          label="재고"
          name="stock"
          type="number"
          min={0}
          defaultValue={defaults?.stock ?? 0}
          error={state.fieldErrors?.stock}
          required
        />
      </div>
      <ImageUploadField defaultValue={defaults?.imageUrl} />
      <div className="space-y-2">
        <Label htmlFor="categoryId">카테고리</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={defaults?.categoryId ?? ""}
          className="border-input w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          <option value="">선택 안 함</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
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

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  error,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  placeholder?: string;
  error?: string;
  min?: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        min={min}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
