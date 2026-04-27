export const metadata = {
  title: "브랜드 소개 | 햄스터 샵",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-bold">브랜드 소개</h1>
      <div className="mt-8 space-y-4 leading-relaxed">
        <p>
          햄스터 샵은 작은 가족 구성원에게 가장 좋은 것만 전하기 위해
          시작되었습니다.
        </p>
        <p>
          사료, 베딩, 장난감, 케이지까지 — 햄스터의 건강과 안전을 최우선으로
          엄선한 제품만 취급합니다. 합리적인 가격, 빠른 배송, 친절한 상담을
          약속드립니다.
        </p>
        <p className="text-muted-foreground text-sm">
          궁금한 점이 있으시면 care.it@rideoffice.kr 로 문의주세요.
        </p>
      </div>
    </main>
  );
}
