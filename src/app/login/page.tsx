import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "로그인 | 햄스터 샵",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        이메일과 비밀번호로 로그인 또는 회원가입할 수 있습니다.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
