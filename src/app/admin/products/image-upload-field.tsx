"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadProductImage } from "./actions";

export function ImageUploadField({
  defaultValue,
}: {
  defaultValue?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadProductImage(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setUrl(result.url);
      }
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="imageUrl">이미지</Label>
      <div className="flex gap-2">
        <Input
          id="imageUrl"
          name="imageUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
        >
          {pending ? "업로드 중..." : "파일 선택"}
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="미리보기"
          className="bg-muted mt-2 size-32 rounded border object-cover"
        />
      )}
    </div>
  );
}
