"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [state, formAction, pending] = useActionState(
    mode === "login" ? login : signup,
    initialState,
  );

  return (
    <div className="space-y-6">
      <div className="bg-muted grid grid-cols-2 rounded-lg p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={tabClass(mode === "login")}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={tabClass(mode === "signup")}
        >
          회원가입
        </button>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="6자 이상"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>
        {state.error && (
          <p className="text-destructive text-sm">{state.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending
            ? "처리 중..."
            : mode === "login"
              ? "로그인"
              : "가입하고 로그인"}
        </Button>
      </form>
    </div>
  );
}

function tabClass(active: boolean) {
  return active
    ? "rounded-md bg-background py-2 font-medium shadow-sm"
    : "rounded-md py-2 text-muted-foreground hover:text-foreground";
}
