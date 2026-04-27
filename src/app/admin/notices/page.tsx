import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { notices } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { deleteNotice } from "./actions";

export default async function AdminNoticesPage() {
  const items = await db
    .select()
    .from(notices)
    .orderBy(desc(notices.isPinned), desc(notices.createdAt));

  return (
    <main>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">공지사항 ({items.length})</h1>
        <Button
          nativeButton={false}
          render={<Link href="/admin/notices/new" />}
        >
          + 새 공지
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground py-16 text-center">
          등록된 공지가 없습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {n.isPinned && (
                        <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
                          고정
                        </span>
                      )}
                      {!n.isPublished && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px]">
                          비공개
                        </span>
                      )}
                      <p className="line-clamp-1 font-medium">{n.title}</p>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      nativeButton={false}
                      render={<Link href={`/admin/notices/${n.id}/edit`} />}
                    >
                      편집
                    </Button>
                    <form action={deleteNotice}>
                      <input type="hidden" name="id" value={n.id} />
                      <Button type="submit" size="sm" variant="destructive">
                        삭제
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
