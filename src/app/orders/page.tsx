import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/db/queries";
import { formatDateTime, formatKrw } from "@/lib/format";
import { ORDER_STATUS_LABEL, statusBadgeClass } from "@/lib/order-status";

export const metadata = {
  title: "주문 내역 | 햄스터 샵",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/orders");

  const items = await getUserOrders(user.id);

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl flex-1 px-6 py-20 text-center">
        <span className="text-6xl">📦</span>
        <h1 className="mt-4 text-2xl font-bold">아직 주문이 없어요</h1>
        <p className="text-muted-foreground mt-2">
          첫 주문을 시작해보세요.
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
    <main className="mx-auto max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">주문 내역 ({items.length})</h1>
      <ul className="space-y-3">
        {items.map((order) => (
          <li key={order.id}>
            <Link href={`/orders/${order.id}`}>
              <Card className="transition hover:shadow-md">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(order.status)}`}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatKrw(order.totalKrw)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
