"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export type LoginState = {
  error?: string;
};

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { error: translateAuthError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function translateAuthError(message: string): string {
  if (/invalid.*credentials/i.test(message)) {
    return "이메일 또는 비밀번호가 올바르지 않습니다";
  }
  if (/already.*registered/i.test(message)) {
    return "이미 가입된 이메일입니다";
  }
  if (/email.*confirm/i.test(message)) {
    return "이메일 인증이 필요합니다 (Supabase에서 'Confirm email'을 끄거나 인증 메일을 확인하세요)";
  }
  if (/rate limit/i.test(message)) {
    return "잠시 후 다시 시도해주세요 (요청 제한)";
  }
  return message;
}
