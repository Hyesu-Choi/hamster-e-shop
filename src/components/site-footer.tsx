import Link from "next/link";

const linkSections = [
  {
    title: "쇼핑",
    links: [
      { href: "/products", label: "전체 상품" },
      { href: "/products?category=food", label: "사료/간식" },
      { href: "/products?category=bedding", label: "베딩" },
      { href: "/products?category=toys", label: "장난감" },
      { href: "/products?category=cage", label: "케이지" },
    ],
  },
  {
    title: "고객 지원",
    links: [
      { href: "/about", label: "브랜드 소개" },
      { href: "/orders", label: "주문 조회" },
      { href: "mailto:care.it@rideoffice.kr", label: "문의하기" },
    ],
  },
  {
    title: "정책",
    links: [
      { href: "#", label: "이용약관" },
      { href: "#", label: "개인정보처리방침" },
      { href: "#", label: "환불 정책" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-card/40 mt-20 border-t">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🐹</span>
              <span className="font-bold tracking-tight">햄스터 샵</span>
            </Link>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              우리 햄찌의 건강한 하루를 위한
              <br />
              엄선된 용품들
            </p>
          </div>
          {linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold">{section.title}</h4>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="my-8" />

        <div className="text-muted-foreground flex flex-col items-start justify-between gap-3 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getUTCFullYear()} 햄스터 샵. All rights reserved.</p>
          <p>care.it@rideoffice.kr</p>
        </div>
      </div>
    </footer>
  );
}
