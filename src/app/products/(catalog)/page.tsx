import Link from "next/link";
import { getProducts } from "@/lib/db/queries";
import { ProductsInfiniteList } from "./products-infinite-list";

type SearchParams = Promise<{ category?: string; q?: string }>;

const PAGE_SIZE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, q } = await searchParams;
  const filter = { category, q };
  const { items, nextCursor } = await getProducts(filter, { limit: PAGE_SIZE });
  const isSearching = !!q?.trim();
  const filterKey = `${category ?? ""}|${q ?? ""}`;

  return (
    <section className="min-h-[60vh]">
      <p className="text-muted-foreground mb-4 text-sm">
        {isSearching ? (
          <>
            <span className="text-foreground font-medium">{q}</span>
            {" "}검색 결과
          </>
        ) : (
          <>최근 등록 순</>
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
        <ProductsInfiniteList
          initialItems={items}
          initialCursor={nextCursor}
          filter={filter}
          filterKey={filterKey}
        />
      )}
    </section>
  );
}
