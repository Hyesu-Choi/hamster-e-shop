"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string };

export function CategoryTabs({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  return (
    <nav className="mb-8 flex flex-wrap gap-2">
      <Chip href="/products" active={!active}>
        전체
      </Chip>
      {categories.map((c) => (
        <Chip
          key={c.slug}
          href={`/products?category=${c.slug}`}
          active={active === c.slug}
        >
          {c.name}
        </Chip>
      ))}
    </nav>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm transition",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}
