import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getOrderById } from "@/lib/db/queries";
import { formatKrw } from "@/lib/format";
import { ORDER_STATUS_LABEL, statusBadgeClass } from "@/lib/order-status";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ placed?: string }>;

export const metadata = {
  title: "주문 상세 | mochiHam",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { placed } = await searchParams;
  const result = await getOrderById(id, user.isAdmin ? undefined : user.id);
  if (!result) notFound();
  const { order, items } = result;

  return (
    <main className="mx-auto max-w-3xl flex-1 px-6 py-10">
      {placed && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          ✅ 주문이 접수되었습니다. 결제 안내는 추후 제공됩니다.
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">주문 상세</h1>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            #{order.id}
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
          <h2 className="mb-4 font-semibold">상품</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-4">
                <div className="bg-muted flex size-16 shrink-0 items-center justify-center rounded text-2xl">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full rounded object-cover"
                    />
                  ) : (
                    "🐹"
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {item.productSlug ? (
                    <Link
                      href={`/products/${item.productSlug}`}
                      className="line-clamp-1 font-medium hover:underline"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="line-clamp-1 font-medium">
                      {item.productName}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1 text-sm">
                    {formatKrw(item.unitPriceKrw)} × {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 font-semibold">
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
