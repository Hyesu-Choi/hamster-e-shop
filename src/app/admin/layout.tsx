import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "어드민 | mochiHam",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isAdmin) redirect("/");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-8">
      <aside className="w-48 shrink-0">
        <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase">
          어드민
        </p>
        <nav className="space-y-1 text-sm">
          <Link
            href="/admin"
            className="hover:bg-muted block rounded px-3 py-2"
          >
            대시보드
          </Link>
          <Link
            href="/admin/products"
            className="hover:bg-muted block rounded px-3 py-2"
          >
            상품
          </Link>
          <Link
            href="/admin/orders"
            className="hover:bg-muted block rounded px-3 py-2"
          >
            주문
          </Link>
          <Link
            href="/admin/notices"
            className="hover:bg-muted block rounded px-3 py-2"
          >
            공지사항
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
