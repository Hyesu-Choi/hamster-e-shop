import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { getOrderById } from "@/lib/db/queries";
import { users } from "@/lib/db/schema";
import { formatDateTime, formatKrw } from "@/lib/format";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VALUES,
  statusBadgeClass,
} from "@/lib/order-status";
import { updateOrderStatus } from "../actions";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const result = await getOrderById(id);
  if (!result) notFound();
  const { order, items } = result;

  const [buyer] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, order.userId))
    .limit(1);

  return (
    <main>
      <Link
        href="/admin/orders"
        className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm"
      >
        ← 주문 목록
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">주문 #{order.id.slice(0, 8)}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {formatDateTime(order.createdAt)} · {buyer?.email}
          </p>
        </div>
        <span
          className={`rounded px-3 py-1 text-sm font-medium ${statusBadgeClass(order.status)}`}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">상태 변경</h2>
          <form
            action={updateOrderStatus}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="orderId" value={order.id} />
            <select
              name="status"
              defaultValue={order.status}
              className="border-input rounded-md border bg-transparent px-3 py-2 text-sm"
            >
              {ORDER_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm">
              저장
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">상품</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 font-medium">{item.productName}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {formatKrw(item.unitPriceKrw)} × {item.quantity}
                  </p>
                </div>
                <span className="font-semibold">
                  {formatKrw(item.unitPriceKrw * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <hr className="my-4" />
          <div className="flex justify-between font-semibold">
            <span>합계</span>
            <span>{formatKrw(order.totalKrw)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">배송 정보</h2>
          <dl className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
            <dt className="text-muted-foreground">받는 분</dt>
            <dd>{order.shippingName}</dd>
            <dt className="text-muted-foreground">연락처</dt>
            <dd>{order.shippingPhone}</dd>
            <dt className="text-muted-foreground">주소</dt>
            <dd className="whitespace-pre-wrap">{order.shippingAddress}</dd>
            {order.shippingMemo && (
              <>
                <dt className="text-muted-foreground">메모</dt>
                <dd className="whitespace-pre-wrap">{order.shippingMemo}</dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}
