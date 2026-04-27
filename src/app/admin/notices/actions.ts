"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { notices } from "@/lib/db/schema";

const noticeSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(200),
  content: z.string().min(1, "내용을 입력하세요").max(5000),
  isPinned: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(true),
});

export type NoticeFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

type ParseResult =
  | { ok: true; data: z.infer<typeof noticeSchema> }
  | { ok: false; state: NoticeFormState };

function parseForm(formData: FormData): ParseResult {
  const raw = {
    title: formData.get("title")?.toString() ?? "",
    content: formData.get("content")?.toString() ?? "",
    isPinned: formData.get("isPinned") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
  const parsed = noticeSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues)
      fieldErrors[i.path.join(".")] = i.message;
    return { ok: false, state: { fieldErrors } };
  }
  return { ok: true, data: parsed.data };
}

export async function createNotice(
  _prev: NoticeFormState,
  formData: FormData,
): Promise<NoticeFormState> {
  await requireAdmin();
  const result = parseForm(formData);
  if (!result.ok) return result.state;

  await db.insert(notices).values(result.data);
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/", "layout");
  redirect("/admin/notices");
}

export async function updateNotice(
  id: string,
  _prev: NoticeFormState,
  formData: FormData,
): Promise<NoticeFormState> {
  await requireAdmin();
  const result = parseForm(formData);
  if (!result.ok) return result.state;

  await db
    .update(notices)
    .set({ ...result.data, updatedAt: new Date() })
    .where(eq(notices.id, id));

  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath(`/notices/${id}`);
  revalidatePath("/", "layout");
  redirect("/admin/notices");
}

export async function deleteNotice(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id")?.toString();
  if (!id) return;

  await db.delete(notices).where(eq(notices.id, id));
  revalidatePath("/admin/notices");
  revalidatePath("/notices");
  revalidatePath("/", "layout");
}
