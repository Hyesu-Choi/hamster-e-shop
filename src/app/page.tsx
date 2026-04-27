import Link from "next/link";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/db/queries";

const categories = [
  {
    slug: "food",
    name: "사료/간식",
    emoji: "🌾",
    desc: "프리미엄 곡물 믹스",
    color: "from-amber-100 to-orange-100",
  },
  {
    slug: "bedding",
    name: "베딩",
    emoji: "🛏️",
    desc: "흡수력 좋은 종이 베딩",
    color: "from-rose-100 to-pink-100",
  },
  {
    slug: "toys",
    name: "장난감",
    emoji: "🎡",
    desc: "쳇바퀴, 터널, 놀이감",
    color: "from-sky-100 to-blue-100",
  },
  {
    slug: "cage",
    name: "케이지",
    emoji: "🏠",
    desc: "안전한 사육장",
    color: "from-emerald-100 to-teal-100",
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: "엄선한 품질",
    desc: "수의사 자문을 거친 안전한 제품만",
  },
  {
    icon: Truck,
    title: "빠른 배송",
    desc: "오후 2시 이전 주문 시 당일 출고",
  },
  {
    icon: ShieldCheck,
    title: "안심 보장",
    desc: "7일 이내 무료 교환·반품",
  },
];

export default async function Home() {
  const featured = await getFeaturedProducts(8);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="from-accent via-background to-background absolute inset-0 bg-linear-to-b" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, oklch(0.85 0.1 60) 0%, transparent 40%), radial-gradient(circle at 80% 60%, oklch(0.85 0.08 30) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
          <span className="bg-card/70 ring-border inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 backdrop-blur">
            🐹 햄스터 전용 프리미엄 셀렉션
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            우리 햄찌에게,
            <br />
            <span className="text-primary">가장 좋은 것만</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base sm:text-lg">
            엄선한 사료, 베딩, 장난감을 합리적인 가격에 만나보세요.
          </p>
          <div className="mt-9 flex justify-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/products" />}
            >
              상품 둘러보기 <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              render={<Link href="/about" />}
            >
              브랜드 소개
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="border-y bg-card/40">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {benefits.map((b) => (
            <div key={b.title} className="flex items-center gap-4 px-6 py-5">
              <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                <b.icon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-muted-foreground text-xs">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">카테고리</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            필요한 항목을 빠르게 찾아보세요
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/products?category=${c.slug}`}
              className="group ring-border hover:ring-primary/40 relative overflow-hidden rounded-2xl ring-1 transition"
            >
              <div
                className={`bg-linear-to-br ${c.color} aspect-4/3 p-5`}
              >
                <span className="text-5xl drop-shadow-sm transition-transform group-hover:scale-110">
                  {c.emoji}
                </span>
              </div>
              <div className="bg-card p-4">
                <p className="font-semibold">{c.name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {c.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">신상품</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                새로 입고된 상품들이에요
              </p>
            </div>
            <Link
              href="/products"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
            >
              전체 보기 <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
