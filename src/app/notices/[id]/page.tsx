import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getNoticeById } from "@/lib/db/queries";
import { formatDateTime } from "@/lib/format";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const notice = await getNoticeById(id);
  return { title: notice ? `${notice.title} | mochiHam` : "공지사항 | mochiHam" };
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const notice = await getNoticeById(id);
  if (!notice) notFound();

  return (
    <main className="mx-auto max-w-3xl flex-1 px-6 py-10">
      <Link
        href="/notices"
        className="text-muted-foreground hover:text-foreground mb-4 inline-block text-sm"
      >
        ← 공지사항 목록
      </Link>

      <Card>
        <CardContent className="p-8">
          <div className="flex items-center gap-2">
            {notice.isPinned && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
                공지
              </span>
            )}
            <span className="text-muted-foreground text-xs">
              {formatDateTime(notice.createdAt)}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-snug">
            {notice.title}
          </h1>
          <hr className="my-6" />
          <div className="leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
