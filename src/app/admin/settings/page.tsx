import { Card, CardContent } from "@/components/ui/card";
import { getShippingConfig } from "@/lib/shipping";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const config = await getShippingConfig();

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">운영 설정</h1>
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="font-semibold">배송비</h2>
          <p className="text-muted-foreground text-sm">
            상품 합계가 무료배송 시작 금액 이상이면 배송비가 0원이 됩니다.
          </p>
          <SettingsForm defaults={config} />
        </CardContent>
      </Card>
    </main>
  );
}
