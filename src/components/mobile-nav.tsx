"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MobileNavItem = { href: string; label: string };

export function MobileNav({
  items,
  isLoggedIn,
}: {
  items: MobileNavItem[];
  isLoggedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 열기"
        onClick={() => setOpen(true)}
        className="hover:bg-muted inline-flex size-9 items-center justify-center rounded-full transition md:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-50 transition-opacity md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "bg-background absolute top-0 left-0 flex h-full w-72 flex-col shadow-xl transition-transform duration-200",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-label="모바일 메뉴"
        >
          <div className="flex items-center justify-between border-b px-5 py-4">
            <Link
              href="/"
              className="font-extrabold tracking-tight"
              onClick={() => setOpen(false)}
            >
              mochiHam
            </Link>
            <button
              type="button"
              aria-label="메뉴 닫기"
              onClick={() => setOpen(false)}
              className="hover:bg-muted inline-flex size-8 items-center justify-center rounded-full"
            >
              <X className="size-4" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-4 text-sm">
            {items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 transition",
                    active
                      ? "bg-accent text-accent-foreground font-medium"
                      : "hover:bg-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4">
            {isLoggedIn ? (
              <form action={logout}>
                <Button type="submit" variant="outline" className="w-full">
                  로그아웃
                </Button>
              </form>
            ) : (
              <Button
                className="w-full"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
