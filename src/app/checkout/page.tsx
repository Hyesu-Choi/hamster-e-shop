import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getCartItems } from "@/lib/db/queries";
import { formatKrw } from "@/lib/format";
import { calculateShipping, getShippingConfig } from "@/lib/shipping";
import { CheckoutForm } from "./checkout-form";

export const metadata = {
  title: "주문서 | mochiHam",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const items = await getCartItems(user.id);
  if (items.length === 0) redirect("/cart");

  const subtotal = items.reduce(
    (sum, i) => sum + i.product.priceKrw * i.quantity,
    0,
  );
  const shippingConfig = await getShippingConfig();
  const shippingKrw = calculateShipping(subtotal, shippingConfig);
  const total = subtotal + shippingKrw;

  return (
    <main className="mx-auto grid max-w-5xl flex-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="mb-6 text-2xl font-bold">주문서</h1>
        <CheckoutForm defaults={{ shippingName: user.name ?? "" }} />
      </section>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">주문 상품</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="line-clamp-1 font-medium">
                      {item.product.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatKrw(item.product.priceKrw)} × {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium">
                    {formatKrw(item.product.priceKrw * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <hr />
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>상품 합계</span>
              <span>{formatKrw(subtotal)}</span>
            </div>
            <div className="text-muted-foreground flex justify-between text-sm">
              <span>배송비</span>
              <span>{shippingKrw === 0 ? "무료" : formatKrw(shippingKrw)}</span>
            </div>
            <hr />
            <div className="flex justify-between font-semibold">
              <span>총 결제 금액</span>
              <span>{formatKrw(total)}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              nativeButton={false}
              render={<Link href="/cart" />}
            >
              장바구니 수정
            </Button>
          </CardContent>
        </Card>
      </aside>
    </main>
  );
}
