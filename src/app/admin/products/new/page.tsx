import { ProductForm } from "../product-form";
import { createProduct } from "../actions";
import { getCategories } from "@/lib/db/queries";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">새 상품 등록</h1>
      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="등록"
      />
    </main>
  );
}
