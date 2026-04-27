import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductForm } from "../../product-form";
import { updateProduct } from "../../actions";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { getCategories } from "@/lib/db/queries";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)
      .then((rows) => rows[0]),
    getCategories(),
  ]);

  if (!product) notFound();

  const action = updateProduct.bind(null, id);

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">상품 편집</h1>
      <ProductForm
        action={action}
        categories={categories}
        submitLabel="저장"
        defaults={{
          slug: product.slug,
          name: product.name,
          description: product.description,
          priceKrw: product.priceKrw,
          stock: product.stock,
          imageUrl: product.imageUrl,
          categoryId: product.categoryId,
          isPublished: product.isPublished,
        }}
      />
    </main>
  );
}
