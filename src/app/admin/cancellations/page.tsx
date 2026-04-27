import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCancellationQueue } from "@/lib/db/queries";
import { formatDateTime, formatKrw } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { approveCancellation, rejectCancellation } from "./actions";

export default async function AdminCancellationsPage() {
  const items = await getCancellationQueue();

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">
        취소 요청 대기 ({items.length})
      </h1>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">
          처리할 취소 요청이 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((req) => (
            <li key={req.id}>
              <Card>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{req.buyerEmail}</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        주문{" "}
                        <Link
                          href={`/admin/orders/${req.orderId}`}
                          className="hover:text-foreground underline"
                        >
                          #{req.orderId.slice(0, 8)}
                        </Link>{" "}
                        ·{" "}
                        {req.orderStatus
                          ? ORDER_STATUS_LABEL[req.orderStatus]
                          : "—"}{" "}
                        · {formatDateTime(req.createdAt)}
                      </p>
                    </div>
                    {req.orderTotal != null && (
                      <span className="font-semibold">
                        {formatKrw(req.orderTotal)}
                      </span>
                    )}
                  </div>
                  <div className="bg-muted/40 rounded-lg p-3 text-sm whitespace-pre-wrap">
                    <span className="text-muted-foreground text-xs font-medium">
                      취소 사유
                    </span>
                    <p className="mt-1">{req.reason}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={approveCancellation} className="flex-1">
                      <input
                        type="hidden"
                        name="requestId"
                        value={req.id}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full"
                      >
                        승인 (재고 복구 + 취소)
                      </Button>
                    </form>
                    <form action={rejectCancellation} className="flex-1">
                      <input
                        type="hidden"
                        name="requestId"
                        value={req.id}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        반려
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
