# 햄스터 샵 (hamster-e-shop)

햄스터 용품 풀스택 쇼핑몰 (MVP).

## 기술 스택

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (base-nova preset, Base UI)
- **Drizzle ORM** + **PostgreSQL** (Supabase)
- **Supabase Auth + Storage** + **Auth.js v5**
- 배포: **Vercel**

## 시작하기

### 1. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열어 Supabase 프로젝트 값으로 채워주세요.

- `DATABASE_URL` — Supabase Dashboard → Project Settings → Database → Connection string (Transaction pooler, port 6543)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API
- `AUTH_SECRET` — `npx auth secret`로 생성

### 2. DB 스키마 적용

```bash
npm run db:push       # 개발 중엔 push로 빠르게 동기화
npm run db:seed       # 샘플 카테고리 + 상품 시드
```

마이그레이션 파일을 만들고 싶으면:

```bash
npm run db:generate
npm run db:migrate
```

### 3. 개발 서버

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

### 4. Drizzle Studio (DB GUI)

```bash
npm run db:studio
```

## 폴더 구조

```
src/
├─ app/                 Next.js App Router (페이지, API)
├─ components/
│  └─ ui/               shadcn/ui 컴포넌트
├─ lib/
│  ├─ db/
│  │  ├─ schema.ts      Drizzle 스키마 (단일 진실 공급원)
│  │  ├─ index.ts       db 클라이언트
│  │  └─ seed.ts        시드 스크립트
│  ├─ supabase/
│  │  ├─ client.ts      브라우저 클라이언트
│  │  ├─ server.ts      서버 클라이언트
│  │  └─ middleware.ts  세션 갱신
│  └─ utils.ts
└─ proxy.ts             Next 16 프록시 (구 middleware)
```

## 배포 (Vercel)

1. GitHub에 푸시
2. Vercel에서 import
3. Environment Variables에 `.env.local`과 동일한 키 등록 (`AUTH_URL`은 배포 도메인으로 변경)
4. 자동 배포

## TODO (다음 단계)

- [ ] `/products` 목록 페이지 (Supabase Storage 이미지 연동)
- [ ] `/products/[slug]` 상세
- [ ] 장바구니 (Server Actions)
- [ ] 로그인 (이메일 + 카카오)
- [ ] 주문서 작성
- [ ] 어드민 (`/admin` — `users.isAdmin` 체크)
- [ ] 결제 (PortOne v2 — 결제 붙일 시점에)
