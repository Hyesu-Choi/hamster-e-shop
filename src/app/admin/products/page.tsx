import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { formatKrw } from "@/lib/format";
import { deleteProduct } from "./actions";

export default async function AdminProductsPage() {
  const items = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 ({items.length})</h1>
        <Button nativeButton={false} render={<Link href="/admin/products/new" />}>
          + 새 상품
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">
          등록된 상품이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id}>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      /{p.slug} · 재고 {p.stock} ·{" "}
                      {p.isPublished ? "공개" : "비공개"}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatKrw(p.priceKrw)}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      nativeButton={false}
                      render={
                        <Link href={`/admin/products/${p.id}/edit`} />
                      }
                    >
                      편집
                    </Button>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="destructive"
                      >
                        삭제
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
