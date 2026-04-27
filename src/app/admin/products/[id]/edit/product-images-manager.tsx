"use client";

import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  addProductImage,
  deleteProductImage,
  uploadProductImage,
} from "../../actions";
import { Button } from "@/components/ui/button";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  position: number;
};

export function ProductImagesManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    startTransition(async () => {
      const upload = new FormData();
      upload.append("file", file);
      const result = await uploadProductImage(upload);
      if (result.error || !result.url) {
        setError(result.error ?? "업로드 실패");
        return;
      }

      const add = new FormData();
      add.append("productId", productId);
      add.append("url", result.url);
      const addResult = await addProductImage(add);
      if (addResult.error) {
        setError(addResult.error);
        return;
      }

      setImages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          url: result.url!,
          alt: null,
          position: prev.length,
        },
      ]);
    });
  }

  function handleDelete(id: string) {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("productId", productId);
    startTransition(async () => {
      await deleteProductImage(formData);
      setImages((prev) => prev.filter((i) => i.id !== id));
    });
  }

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">추가 이미지 ({images.length})</p>
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
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={pending}
        >
          {pending ? "처리 중..." : "+ 이미지 추가"}
        </Button>
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}

      {images.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-xs">
          대표 이미지 외 추가 이미지가 없습니다.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="bg-muted aspect-square w-full rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                disabled={pending}
                aria-label="삭제"
                className="bg-background/80 hover:bg-destructive hover:text-destructive-foreground absolute top-1 right-1 inline-flex size-7 items-center justify-center rounded-full border opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
