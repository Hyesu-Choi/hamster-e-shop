import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getPublishedNotices } from "@/lib/db/queries";
import { formatDateTime } from "@/lib/format";

export const metadata = {
  title: "공지사항 | mochiHam",
};

export default async function NoticesPage() {
  const items = await getPublishedNotices();

  return (
    <main className="mx-auto max-w-3xl flex-1 px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">공지사항</h1>
        <p className="text-muted-foreground mt-1.5">
          mochiHam의 새로운 소식을 확인해보세요
        </p>
      </header>

      {items.length === 0 ? (
        <div className="bg-muted/40 flex flex-col items-center justify-center rounded-2xl py-24 text-center">
          <span className="text-5xl">📢</span>
          <p className="text-muted-foreground mt-4">
            아직 등록된 공지사항이 없어요.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={n.id}>
              <Link href={`/notices/${n.id}`}>
                <Card className="transition hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-2">
                      {n.isPinned && (
                        <span className="bg-primary/10 text-primary mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold">
                          공지
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="line-clamp-1 font-medium">{n.title}</h2>
                        <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">
                          {n.content}
                        </p>
                      </div>
                      <span className="text-muted-foreground shrink-0 text-xs">
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
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
