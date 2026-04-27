"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryImage = { id: string; url: string; alt: string | null };

export function ProductGallery({
  images,
  fallback,
  productName,
}: {
  images: GalleryImage[];
  fallback: React.ReactNode;
  productName: string;
}) {
  const [activeId, setActiveId] = useState(images[0]?.id ?? null);
  const active = images.find((i) => i.id === activeId) ?? images[0];

  if (images.length === 0) {
    return (
      <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl">
        {fallback}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.url}
          alt={active.alt ?? productName}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveId(img.id)}
              onMouseEnter={() => setActiveId(img.id)}
              aria-label={`이미지 ${img.id}`}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded-lg border-2 transition",
                activeId === img.id
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? productName}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
