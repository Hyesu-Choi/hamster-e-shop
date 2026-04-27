import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { getProductBySlug } from "@/lib/db/queries";
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

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "상품 없음 | 햄스터 샵" };
  return {
    title: `${product.name} | 햄스터 샵`,
    description: product.description ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 5;
  const gradient =
    categoryGradient[product.categorySlug ?? ""] ?? "from-muted to-muted";

  return (
    <main className="mx-auto max-w-5xl flex-1 px-6 py-10">
      <nav className="text-muted-foreground mb-6 text-sm">
        <Link href="/products" className="hover:text-foreground">
          상품
        </Link>
        {product.categorySlug && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${product.categorySlug}`}
              className="hover:text-foreground"
            >
              {product.categoryName}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div
          className={`relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br ${gradient}`}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-9xl drop-shadow-sm">
              {categoryEmoji[product.categorySlug ?? ""] ?? "🐹"}
            </span>
          )}
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <span className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-semibold">
                품절
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col">
          {product.categoryName && (
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {product.categoryName}
            </span>
          )}
          <h1 className="mt-2 text-3xl font-bold leading-tight">
            {product.name}
          </h1>
          <p className="text-primary mt-4 text-3xl font-bold">
            {formatKrw(product.priceKrw)}
          </p>

          {product.description && (
            <p className="text-muted-foreground mt-6 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="bg-muted mt-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
            {soldOut ? (
              <span className="text-destructive font-medium">품절</span>
            ) : lowStock ? (
              <span className="text-destructive font-medium">
                재고 {product.stock}개 — 품절 임박
              </span>
            ) : (
              <span className="text-muted-foreground">
                재고 {product.stock}개
              </span>
            )}
          </div>

          <div className="mt-auto pt-10">
            <AddToCartForm productId={product.id} stock={product.stock} />
          </div>
        </div>
      </div>
    </main>
  );
}
