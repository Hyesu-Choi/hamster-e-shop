# mochiHam — 사양서 (SPEC)

햄스터 용품 풀스택 이커머스 사이트.

> **운영 목적**: 포트폴리오/학습용. 실제 결제 미연동, 법적 컴플라이언스 의무 없음. **코드 품질과 UX 다양성**을 보여주는 데 집중한다.

---

## 1. 기술 스택 (확정)

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | **Next.js 16** (App Router, Turbopack) | 풀스택 단일 레포, 서버 컴포넌트, Vercel 친화적 |
| 언어 | TypeScript 5 | 타입 안전성 |
| 스타일 | Tailwind CSS v4 + shadcn/ui (base-nova preset) | 빠른 폴리싱, Base UI 기반 컴포넌트 |
| 폰트 | Pretendard Variable | 한글 가독성 우선 |
| ORM | Drizzle ORM | 서버리스 콜드 스타트 빠름, SQL 친화 |
| DB | Supabase Postgres (Transaction pooler, port 6543) | 무료 티어 충분, Auth/Storage 통합 |
| 인증 | Supabase Auth (이메일+비밀번호) | 간단, "Confirm email" OFF로 운영 |
| 파일 저장 | Supabase Storage (`products` 버킷, public) | 상품 이미지/리뷰 사진 |
| 배포 | Vercel (region: `icn1` Seoul) | Next.js 호환성 1순위 |
| 이메일 | Resend (3,000건/월 무료) | 주문 접수/배송 알림용 |
| 검색 | Postgres ILIKE | 한국어 부분 일치, MVP에 충분 |
| 모니터링 | 없음 | 포트폴리오 단계 — 필요 시 Sentry 추가 |

**제외 (의도적)**
- 실제 PG 결제 (PortOne/토스페이먼츠) — 더미 결제 흐름만 시뮬레이션
- 다크 모드 — 햄스터 톤은 라이트가 더 어울림
- 사업자 등록 / 통신판매업 신고 / 약관 / 개인정보처리방침 — 포트폴리오라 미적용

---

## 2. 도메인 모델

### 2.1 엔티티 (Drizzle 스키마)

```
users (Supabase auth.users.id 매칭)
  ├─ id: uuid (PK, auth.users.id와 동일 값)
  ├─ email: unique
  ├─ name?: string
  ├─ imageUrl?: string
  ├─ isAdmin: boolean (단일 권한 플래그)
  └─ createdAt

categories
  ├─ id, slug (unique), name, description?
  └─ 시드: food / bedding / toys / cage

products
  ├─ id, slug (unique), name, description?
  ├─ priceKrw: integer (할인가 또는 정가)
  ├─ originalPriceKrw?: integer (할인 표시용 — null이면 할인 없음) 🆕
  ├─ stock: integer
  ├─ categoryId: FK → categories
  ├─ isPublished: boolean
  └─ createdAt, updatedAt

product_images 🆕 (다중 이미지 지원)
  ├─ id, productId: FK
  ├─ url: string
  ├─ alt?: string
  ├─ position: integer (정렬 순서)
  └─ isPrimary: boolean

cart_items
  ├─ id, userId: FK
  ├─ productId: FK
  ├─ quantity: integer
  └─ createdAt
  ※ 비로그인 장바구니는 localStorage에 별도 저장 (DB 없음)

orders
  ├─ id, userId: FK
  ├─ status: enum [pending, paid, shipped, delivered, cancelled]
  ├─ totalKrw: integer (= itemsKrw + shippingKrw)
  ├─ itemsKrw: integer 🆕
  ├─ shippingKrw: integer 🆕
  ├─ shippingName, shippingPhone, shippingAddress, shippingMemo?
  └─ createdAt

order_items
  ├─ id, orderId: FK, productId: FK
  ├─ productName, unitPriceKrw, quantity (스냅샷)

reviews 🆕
  ├─ id, userId: FK, productId: FK, orderItemId: FK (구매 확인용)
  ├─ rating: integer (1~5)
  ├─ content: text
  ├─ createdAt, updatedAt
  └─ unique(userId, orderItemId) — 주문 1건당 리뷰 1개

notices
  ├─ id, title, content
  ├─ isPinned: boolean (상단 배너 노출)
  ├─ isPublished: boolean
  └─ createdAt, updatedAt

settings 🆕 (운영 설정 키-값)
  ├─ key: text (PK) — e.g. "shipping_fee_krw", "free_shipping_threshold_krw"
  └─ value: text
```

### 2.2 가격/배송비 규칙

- **할인 표시**: `originalPriceKrw`가 있고 `> priceKrw`면 취소선 + 할인율 노출
- **배송비**:
  - `itemsKrw < free_shipping_threshold_krw` → `shipping_fee_krw` 부과
  - `itemsKrw >= free_shipping_threshold_krw` → 0원
  - 기본값: 배송비 3,000원, 50,000원 이상 무료
- **가격은 모두 정수 KRW** (소수점 없음, Intl.NumberFormat 사용)

---

## 3. 라우트 맵

### 3.1 사용자 (Public)
- `/` — 홈 (히어로, 카테고리, 신상품, 고정 공지 배너)
- `/products` — 목록 (카테고리 필터 + **검색 ?q=** + 무한 스크롤)
- `/products/[slug]` — 상세 (이미지 갤러리, 리뷰 목록)
- `/notices`, `/notices/[id]` — 공지사항
- `/about` — 브랜드 소개
- `/login` — 로그인/회원가입 탭

### 3.2 사용자 (Auth)
- `/cart` — 장바구니 (서버: 로그인 사용자, 클라이언트: localStorage 비로그인)
- `/checkout` — 주문서 작성
- `/orders` — 내 주문 (무한 스크롤)
- `/orders/[id]` — 주문 상세 (+ 본인 취소 버튼: pending일 때만)
- `/account` 🆕 — 회원 정보 수정 (이름, 기본 배송지)

### 3.3 어드민 (`isAdmin: true` 필수)
- `/admin` — 대시보드 (KPI 카드)
- `/admin/products`, `/new`, `/[id]/edit` — 상품 CRUD
- `/admin/categories` 🆕 — 카테고리 CRUD
- `/admin/orders`, `/[id]` — 주문 관리 + 상태 변경 + **결제 후 취소 승인 큐** 🆕
- `/admin/notices`, `/new`, `/[id]/edit` — 공지 CRUD
- `/admin/reviews` 🆕 — 리뷰 모더레이션 (신고 처리)
- `/admin/settings` 🆕 — 배송비 임계값 등 운영 설정

---

## 4. 핵심 의사결정 (Why & 트레이드오프)

### 4.1 재고: 낙관적 락
- **선택**: 주문 트랜잭션 내 `SELECT stock FOR UPDATE` 후 `UPDATE` 또는 `UPDATE ... WHERE stock >= qty` 패턴.
- **거부 케이스**: 트랜잭션 실패 시 사용자에게 "재고 부족" 즉시 알림.
- **거부한 대안**:
  - *비관적 N분 예약*: 한정판 아니면 과잉. 만료 잡 운영 부담.
  - *오버셀 후 사후 환불*: PG 미연동이라 시뮬레이션 의미 없음.

### 4.2 비로그인 장바구니
- **클라이언트**: localStorage에 `[{ productId, quantity }]` 저장.
- **로그인 시 병합**: `mergeAnonymousCart()` 서버 액션이 localStorage 데이터를 받아 같은 상품은 quantity 합산, 신규는 insert. 합산 시 `Math.min(merged, stock)`.
- **만료**: 30일 후 자동 정리 (클라이언트 timestamp 체크).
- **재고 검증**: 결제 시점에 한 번 더 검증 (같은 상품을 다른 사용자가 사간 후일 수 있음).

### 4.3 주문 취소 흐름
| 상태 | 사용자 권한 | 어드민 권한 |
|---|---|---|
| `pending` | ✅ 즉시 취소 (재고 복구 트랜잭션) | ✅ 동일 |
| `paid` | 요청만 가능 (cancellation request 테이블) | ✅ 승인 → 환불 처리 (시뮬레이션) → 재고 복구 |
| `shipped` 이후 | 반품 신청만 (별도 흐름, 본 SPEC 외) | — |

🆕 `cancellation_requests` 테이블:
```
id, orderId, requestedBy, reason, status [requested/approved/rejected], adminNote, createdAt, resolvedAt
```

### 4.4 검색: Postgres ILIKE
- **쿼리**: `WHERE name ILIKE '%' || $1 || '%' OR description ILIKE '%' || $1 || '%'`
- **인덱스**: 우선 미적용. 상품 1,000개 넘어가면 `pg_trgm` GIN 인덱스 추가.
- **거부한 대안**: Meilisearch/Algolia는 외부 의존 + 동기화 운영 부담. MVP 과잉.

### 4.5 페이지네이션: 커서 기반 무한 스크롤
- **커서**: `createdAt DESC, id DESC` (tiebreaker로 id 동률 처리)
- **API**: Server Action 또는 Route Handler가 `{ items, nextCursor }` 반환.
- **클라이언트**: IntersectionObserver로 마지막 카드 진입 시 다음 페이지 fetch.
- **거부한 대안**: OFFSET 기반은 큰 OFFSET에서 느리고 데이터 변경 시 중복/누락 발생.

### 4.6 모바일 네비
- **드로워**: `Sheet` (shadcn 또는 Base UI)로 좌측 슬라이드 메뉴.
- **트리거**: 햄버거 아이콘 (`md:hidden`).
- **포함 메뉴**: 카테고리 4개 + 공지/소개/주문내역(로그인 시)/어드민(어드민일 때).

### 4.7 어드민 권한
- **단일 플래그**: `users.isAdmin`
- **승격**: `update users set is_admin = true where email = '...'` (수동 SQL)
- **확장 시**: `role enum [user, staff, admin]` + 권한 체크 미들웨어. 본 SPEC에서는 미구현.

### 4.8 리뷰 (구매 확인)
- **작성 가능 조건**: `orders.status = delivered` AND `order_items.productId = X` AND `해당 orderItem에 리뷰 없음`.
- **사진 리뷰**: 이번 SPEC 외 (스코프 컨트롤). 텍스트 + 별점만.
- **수정/삭제**: 작성 후 N일 이내 수정 가능. 삭제는 작성자만 (어드민은 신고 시).
- **노출**: 상품 상세 하단. 평균 별점 + 건수 캐싱(materialized view 또는 review_aggregate 테이블).

---

## 5. 동시성/엣지 케이스 처리

| 상황 | 처리 |
|---|---|
| 동시 결제로 마지막 재고 1개 충돌 | 트랜잭션에서 `UPDATE ... SET stock = stock - $1 WHERE id = $2 AND stock >= $1` returning. 0행이면 에러. |
| 비로그인 장바구니에 담은 상품이 품절 | 결제 진입 시 재검증 → "품절 상품 제거됨" 알림 + 자동 제거. |
| 주문 후 상품 가격이 바뀜 | `order_items`에 `unitPriceKrw` 스냅샷. 주문 화면은 항상 스냅샷 사용. |
| 주문 후 상품이 삭제됨 | `order_items.productId` 는 `restrict` (삭제 차단). 비공개 처리만 허용. |
| 어드민이 상품 삭제 시도 | 주문 이력 있으면 차단, "비공개 처리"를 권유하는 모달. |
| 회원 탈퇴 | 본 SPEC 외 (포트폴리오 단계). 추후 soft delete + 익명화. |
| 매직 링크 이메일 rate limit | "Confirm email" OFF로 우회. 비밀번호 로그인만 사용. |
| 카테고리 삭제 시 상품 처리 | `categoryId: set null`. 어드민 UI에 경고. |

---

## 6. 보안

- **service_role 키**: 서버 전용 (`src/lib/supabase/admin.ts`에서 `import "server-only"`).
- **`NEXT_PUBLIC_*`만 클라이언트 노출**.
- **어드민 라우트**: `requireAdmin()` 헬퍼로 매 요청 검증.
- **CSRF**: Next.js Server Actions 기본 보호 (Origin 헤더 검증).
- **Rate limiting**: MVP 단계 미구현. 운영 시 Vercel Edge Middleware로 추가.
- **SQL Injection**: Drizzle 파라미터화 쿼리만 사용. raw SQL 금지.
- **XSS**: 모든 출력은 React 자동 escape. 사용자 입력 dangerouslySetInnerHTML 절대 금지.
- **이미지 업로드**: 5MB 제한, MIME 타입 화이트리스트 (`image/*`), UUID 파일명.

---

## 7. 비기능 요구사항

| 항목 | 목표 |
|---|---|
| 페이지 LCP (Vercel/Seoul) | < 2.0s |
| 상품 상세 TTFB | < 500ms (DB 1쿼리 + 이미지 N개) |
| 모바일 가용성 | iOS Safari, Android Chrome 최신 2버전 |
| 접근성 | WCAG 2.1 AA 지향 (실측 미적용) |
| 한글 폰트 로드 | Pretendard Variable, 본문 400 / 굵은체 700 |
| 번들 사이즈 | First Load JS < 200KB (현 14x KB) |

---

## 8. 운영 흐름 (포트폴리오 시뮬레이션)

### 8.1 결제는 더미
- `/checkout` 클릭 시 `placeOrder` 액션 → `status: pending` 으로 주문 생성
- "결제하기" 버튼 (시뮬레이션) → 5초 대기 → 90% 확률 `paid`, 10% 확률 `pending` 유지 (취소 흐름 테스트용)
- 실 결제 연동 시 PortOne v2 webhook으로 교체

### 8.2 운영자 일과
1. `/admin` 들어가서 KPI 확인 (재고 부족 / 대기 주문 / 신규 리뷰)
2. `/admin/orders` 에서 paid → shipped 변경 (트래킹 번호 입력 추후)
3. `/admin/products` 에서 재고 보충
4. `/admin/notices` 에서 신상품 입고 공지

---

## 9. 구현 우선순위

### ✅ Phase 1 — 완료
- 인증 (이메일/비밀번호)
- 상품 CRUD (어드민)
- 장바구니 (로그인 사용자만)
- 주문 생성 (재고 차감 트랜잭션)
- 주문 내역 + 어드민 주문 관리
- 공지사항 CRUD + 상단 배너
- 이미지 업로드 (Supabase Storage)
- UI 폴리싱 (앰버 톤, Pretendard)
- Vercel 배포 준비

### 🚧 Phase 2 — Next
1. **상품 검색 UI** (?q=) — ILIKE
2. **모바일 햄버거 + 드로워**
3. **비로그인 장바구니** (localStorage + 로그인 시 병합)
4. **상품 다중 이미지** (`product_images` 테이블 + 갤러리)
5. **정가/할인가** (`originalPriceKrw` 컬럼 + 카드/상세 표시)
6. **배송비 계산** (`settings` 테이블 + checkout 합계)
7. **주문 취소** — pending 자체 취소 + paid 어드민 승인 큐
8. **무한 스크롤** — 상품 목록부터

### 📋 Phase 3 — Later
9. 리뷰 (구매 확인 + 별점 + 텍스트)
10. 카테고리 어드민 관리
11. `/account` 회원 정보 수정
12. 이메일 알림 (Resend) — 주문 접수 + 배송 시작
13. 더미 결제 시뮬레이션 흐름
14. SEO (sitemap.xml, robots.txt, OG 메타)

### ❄️ 본 SPEC 외 (의도적 제외)
- 실제 결제 연동 (PortOne v2)
- 다크 모드
- 다국어 (i18n)
- 위시리스트
- 쿠폰/프로모션 시스템 (정가/할인가만)
- 사진 리뷰
- B2B 기능
- 회원 탈퇴 / 데이터 익명화
- 사업자 등록 / 약관 / 개인정보처리방침
- 모니터링 (Sentry / Datadog)
- 자동화 테스트 (Playwright / Vitest)
- CI/CD 파이프라인 (Vercel 자동 배포로 충분)

---

## 10. 폴더 구조

```
src/
├─ app/
│  ├─ (root pages)
│  ├─ products/
│  │  ├─ (catalog)/      ← Route Group: layout 공유
│  │  │  ├─ layout.tsx   ← 헤더/카테고리 칩 (filter 변경 시 마운트 유지)
│  │  │  ├─ page.tsx     ← 그리드 + 무한 스크롤
│  │  │  └─ category-tabs.tsx (Client)
│  │  └─ [slug]/page.tsx
│  ├─ cart/, checkout/, orders/, login/, notices/, about/, account/
│  └─ admin/
│     ├─ layout.tsx, page.tsx
│     ├─ products/, orders/, notices/, categories/, settings/
├─ components/
│  ├─ site-header.tsx, site-footer.tsx, notice-banner.tsx, product-card.tsx
│  └─ ui/ (shadcn)
├─ lib/
│  ├─ db/ (schema, queries, seed)
│  ├─ supabase/ (client, server, middleware, admin)
│  ├─ auth.ts, format.ts, order-status.ts, utils.ts
└─ proxy.ts (Next 16: 구 middleware)
```

---

## 11. 환경 변수

| 변수 | 위치 | 설명 |
|---|---|---|
| `DATABASE_URL` | server | Supabase Transaction Pooler URL (port 6543) |
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client+server | Supabase anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | **server만** | 어드민 작업 (이미지 업로드 등) |
| `RESEND_API_KEY` | server (Phase 3) | 이메일 발송 |

---

## 12. 미해결/오픈 질문

- 이메일 템플릿 디자인 (텍스트만 vs HTML, 브랜드 톤)
- 로그인 후 next 파라미터 처리 (현재는 일부만 적용)
- 비밀번호 재설정 흐름 (이메일 rate limit 우려)
- 카테고리 삭제 시 상품의 `categoryId` 처리 UX
- 상품 매진 후 "재입고 알림" 신청 기능 — 보류

---

_마지막 업데이트: 2026-04-27_
