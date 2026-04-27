import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { getCartCount } from "@/app/cart/actions";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.id) : 0;

  return (
    <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight">
            mochiHam
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link
            href="/products"
            className="hover:text-primary text-foreground/80 transition"
          >
            상품
          </Link>
          {user && (
            <Link
              href="/orders"
              className="hover:text-primary text-foreground/80 transition"
            >
              주문내역
            </Link>
          )}
          <Link
            href="/notices"
            className="hover:text-primary text-foreground/80 transition"
          >
            공지사항
          </Link>
          <Link
            href="/about"
            className="hover:text-primary text-foreground/80 transition"
          >
            소개
          </Link>
          {user?.isAdmin && (
            <Link
              href="/admin"
              className="hover:text-primary text-foreground/80 transition"
            >
              어드민
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label="장바구니"
            className="hover:bg-muted relative inline-flex size-9 items-center justify-center rounded-full transition"
          >
            <ShoppingBag className="size-4.5" />
            {cartCount > 0 && (
              <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <form action={logout}>
              <Button type="submit" size="sm" variant="ghost">
                로그아웃
              </Button>
            </form>
          ) : (
            <Button
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              <User className="size-4" /> 로그인
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
