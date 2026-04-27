import { NoticeForm } from "../notice-form";
import { createNotice } from "../actions";

export default function NewNoticePage() {
  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold">새 공지사항</h1>
      <NoticeForm action={createNotice} submitLabel="등록" />
    </main>
  );
}
