import { count, eq, lte } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import {
  cancellationRequests,
  orders,
  products,
} from "@/lib/db/schema";

export default async function AdminDashboard() {
  const [productStats, lowStock, orderStats, cancellationStats] =
    await Promise.all([
      db
        .select({
          total: count(),
        })
        .from(products),
      db
        .select({ count: count() })
        .from(products)
        .where(lte(products.stock, 5)),
      db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.status, "pending")),
      db
        .select({ count: count() })
        .from(cancellationRequests)
        .where(eq(cancellationRequests.status, "requested")),
    ]);

  const cards = [
    {
      label: "전체 상품",
      value: productStats[0]?.total ?? 0,
      href: "/admin/products",
    },
    {
      label: "재고 부족 (5개 이하)",
      value: lowStock[0]?.count ?? 0,
      href: "/admin/products",
    },
    {
      label: "대기 중인 주문",
      value: orderStats[0]?.count ?? 0,
      href: "/admin/orders",
    },
    {
      label: "취소 요청 대기",
      value: cancellationStats[0]?.count ?? 0,
      href: "/admin/cancellations",
    },
  ];

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">대시보드</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="transition hover:shadow-md">
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm">{c.label}</p>
                <p className="mt-2 text-3xl font-bold">{c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
