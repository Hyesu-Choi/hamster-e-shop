import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getCartItems } from "@/lib/db/queries";
import { formatKrw } from "@/lib/format";
import { removeFromCart, updateCartQuantity } from "./actions";

export const metadata = {
  title: "장바구니 | 햄스터 샵",
};

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/cart");

  const items = await getCartItems(user.id);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.priceKrw * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-6 py-20 text-center">
        <span className="text-6xl">🛒</span>
        <h1 className="mt-4 text-2xl font-bold">장바구니가 비어있어요</h1>
        <p className="text-muted-foreground mt-2">
          마음에 드는 상품을 담아보세요.
        </p>
        <Button
          className="mt-6"
          size="lg"
          nativeButton={false}
          render={<Link href="/products" />}
        >
          상품 둘러보기
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl flex-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
      <section>
        <h1 className="mb-6 text-2xl font-bold">장바구니 ({items.length})</h1>
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="bg-muted flex size-20 shrink-0 items-center justify-center rounded text-3xl"
                  >
                    {item.product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      "🐹"
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="line-clamp-1 font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {formatKrw(item.product.priceKrw)}
                    </p>
                    <form
                      action={updateCartQuantity}
                      className="mt-2 flex items-center gap-2"
                    >
                      <input type="hidden" name="itemId" value={item.id} />
                      <label
                        htmlFor={`qty-${item.id}`}
                        className="text-muted-foreground text-xs"
                      >
                        수량
                      </label>
                      <select
                        id={`qty-${item.id}`}
                        name="quantity"
                        defaultValue={item.quantity}
                        className="rounded border px-2 py-1 text-sm"
                      >
                        {Array.from(
                          { length: Math.min(item.product.stock, 10) },
                          (_, i) => i + 1,
                        ).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                      <Button type="submit" size="xs" variant="outline">
                        변경
                      </Button>
                    </form>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">
                      {formatKrw(item.product.priceKrw * item.quantity)}
                    </p>
                    <form action={removeFromCart}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <Button
                        type="submit"
                        size="xs"
                        variant="ghost"
                        className="text-muted-foreground"
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
      </section>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">주문 요약</h2>
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>상품 합계</span>
              <span>{formatKrw(subtotal)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>배송비</span>
              <span>주문 시 계산</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>예상 결제 금액</span>
              <span>{formatKrw(subtotal)}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              nativeButton={false}
              render={<Link href="/checkout" />}
            >
              주문하기
            </Button>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
