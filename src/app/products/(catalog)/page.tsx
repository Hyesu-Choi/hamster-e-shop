import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/db/queries";

type SearchParams = Promise<{ category?: string; q?: string }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, q } = await searchParams;
  const items = await getProducts({ category, q });
  const isSearching = !!q?.trim();

  return (
    <section className="min-h-[60vh]">
      <p className="text-muted-foreground mb-4 text-sm">
        {isSearching ? (
          <>
            <span className="text-foreground font-medium">{q}</span>
            {" "}검색 결과 {" "}
            <span className="text-foreground font-medium">{items.length}</span>개
          </>
        ) : (
          <>
            총{" "}
            <span className="text-foreground font-medium">{items.length}</span>
            개
          </>
        )}
      </p>

      {items.length === 0 ? (
        <div className="bg-muted/40 flex flex-col items-center justify-center rounded-2xl py-24 text-center">
          <span className="text-5xl">{isSearching ? "🔍" : "🐹"}</span>
          <p className="text-muted-foreground mt-4">
            {isSearching
              ? "검색 결과가 없어요."
              : "아직 이 카테고리에는 상품이 없어요."}
          </p>
          <Link
            href="/products"
            className="text-primary hover:text-primary/80 mt-4 inline-block text-sm font-medium"
          >
            전체 상품 보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </section>
  );
}
