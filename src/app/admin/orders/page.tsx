import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { formatDateTime, formatKrw } from "@/lib/format";
import { ORDER_STATUS_LABEL, statusBadgeClass } from "@/lib/order-status";

export default async function AdminOrdersPage() {
  const items = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalKrw: orders.totalKrw,
      shippingName: orders.shippingName,
      createdAt: orders.createdAt,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt));

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">주문 ({items.length})</h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">
          접수된 주문이 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/orders/${o.id}`}>
                <Card className="transition hover:shadow-md">
                  <CardContent className="flex items-center gap-4 p-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(o.status)}`}
                    >
                      {ORDER_STATUS_LABEL[o.status]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {o.shippingName}{" "}
                        <span className="text-muted-foreground text-sm">
                          ({o.userEmail})
                        </span>
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        #{o.id.slice(0, 8)} · {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatKrw(o.totalKrw)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
