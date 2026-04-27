import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { getCartCount } from "@/app/cart/actions";
import { logout } from "@/app/login/actions";
import { AnonCartCountBadge } from "@/components/cart-count-badge";
import { CartMerger } from "@/components/cart-merger";
import { MobileNav, type MobileNavItem } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.id) : 0;

  const navItems: MobileNavItem[] = [
    { href: "/products", label: "상품" },
    { href: "/notices", label: "공지사항" },
    { href: "/about", label: "소개" },
    ...(user ? [{ href: "/orders", label: "주문내역" }] : []),
    ...(user?.isAdmin ? [{ href: "/admin", label: "어드민" }] : []),
  ];

  return (
    <>
      <CartMerger isLoggedIn={!!user} />
      <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <MobileNav items={navItems} isLoggedIn={!!user} />
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-extrabold tracking-tight">
              mochiHam
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-primary text-foreground/80 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            aria-label="장바구니"
            className="hover:bg-muted relative inline-flex size-9 items-center justify-center rounded-full transition"
          >
            <ShoppingBag className="size-4.5" />
            {user ? (
              cartCount > 0 && (
                <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
                  {cartCount}
                </span>
              )
            ) : (
              <AnonCartCountBadge />
            )}
          </Link>

          {user ? (
            <form action={logout} className="hidden md:block">
              <Button type="submit" size="sm" variant="ghost">
                로그아웃
              </Button>
            </form>
          ) : (
            <Button
              size="sm"
              className="hidden md:inline-flex"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              <User className="size-4" /> 로그인
            </Button>
          )}
        </div>
      </div>
      </header>
    </>
  );
}
