export const ORDER_STATUS_LABEL = {
  pending: "결제 대기",
  paid: "결제 완료",
  shipped: "배송 중",
  delivered: "배송 완료",
  cancelled: "취소",
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_LABEL;

export const ORDER_STATUS_VALUES = Object.keys(
  ORDER_STATUS_LABEL,
) as OrderStatus[];

export function statusBadgeClass(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-indigo-100 text-indigo-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-gray-100 text-gray-600";
  }
}
