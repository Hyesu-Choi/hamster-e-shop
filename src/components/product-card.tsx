import Link from "next/link";
import { formatKrw } from "@/lib/format";

const categoryEmoji: Record<string, string> = {
  food: "🌾",
  bedding: "🛏️",
  toys: "🎡",
  cage: "🏠",
};

const categoryGradient: Record<string, string> = {
  food: "from-amber-100 to-orange-100",
  bedding: "from-rose-100 to-pink-100",
  toys: "from-sky-100 to-blue-100",
  cage: "from-emerald-100 to-teal-100",
};

export type ProductCardProps = {
  slug: string;
  name: string;
  priceKrw: number;
  originalPriceKrw?: number | null;
  stock: number;
  imageUrl: string | null;
  categorySlug?: string | null;
};

export function ProductCard({
  slug,
  name,
  priceKrw,
  originalPriceKrw,
  stock,
  imageUrl,
  categorySlug,
}: ProductCardProps) {
  const soldOut = stock <= 0;
  const lowStock = !soldOut && stock <= 5;
  const onSale =
    originalPriceKrw != null && originalPriceKrw > priceKrw;
  const discountPct = onSale
    ? Math.round(((originalPriceKrw - priceKrw) / originalPriceKrw) * 100)
    : 0;
  const gradient = categoryGradient[categorySlug ?? ""] ?? "from-muted to-muted";

  return (
    <Link
      href={`/products/${slug}`}
      className="group ring-border hover:ring-primary/40 block overflow-hidden rounded-2xl bg-card ring-1 transition hover:shadow-md"
    >
      <div
        className={`relative aspect-square overflow-hidden bg-linear-to-br ${gradient}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
            {categoryEmoji[categorySlug ?? ""] ?? "🐹"}
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-foreground">
              품절
            </span>
          </div>
        )}
        {lowStock && (
          <span className="absolute top-3 left-3 rounded-full bg-destructive/90 px-2.5 py-1 text-[11px] font-medium text-white">
            재고 {stock}개
          </span>
        )}
        {onSale && !soldOut && (
          <span className="absolute top-3 right-3 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-white">
            {discountPct}%
          </span>
        )}
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-2 min-h-[2.5em] text-sm font-medium leading-snug">
          {name}
        </h3>
        {onSale ? (
          <div className="flex items-baseline gap-2">
            <span className="text-rose-600 text-base font-bold">
              {formatKrw(priceKrw)}
            </span>
            <span className="text-muted-foreground text-xs line-through">
              {formatKrw(originalPriceKrw!)}
            </span>
          </div>
        ) : (
          <p className="text-base font-bold">{formatKrw(priceKrw)}</p>
        )}
      </div>
    </Link>
  );
}
