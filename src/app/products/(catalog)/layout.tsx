import { getCategories } from "@/lib/db/queries";
import { CategoryTabs } from "./category-tabs";

export const metadata = {
  title: "상품 | mochiHam",
};

export default async function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <main className="mx-auto max-w-6xl flex-1 px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">상품</h1>
        <p className="text-muted-foreground mt-1.5">
          햄스터 용품을 카테고리별로 만나보세요
        </p>
      </header>

      <CategoryTabs categories={categories} />

      {children}
    </main>
  );
}
