import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { NoticeForm } from "../../notice-form";
import { updateNotice } from "../../actions";
import { db } from "@/lib/db";
import { notices } from "@/lib/db/schema";

type Params = Promise<{ id: string }>;

export default async function EditNoticePage({ params }: { params: Params }) {
  const { id } = await params;
  const [notice] = await db
    .select()
    .from(notices)
    .where(eq(notices.id, id))
    .limit(1);

  if (!notice) notFound();

  const action = updateNotice.bind(null, id);

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">공지사항 편집</h1>
      <NoticeForm
        action={action}
        submitLabel="저장"
        defaults={{
          title: notice.title,
          content: notice.content,
          isPinned: notice.isPinned,
          isPublished: notice.isPublished,
        }}
      />
    </main>
  );
}
