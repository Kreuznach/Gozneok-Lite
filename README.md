# 고요한 산책 (Gozneok Lite) · v0.1.3

> 지금 조용하게 머물기 좋은 장소를 빠르게 추천해주는 **Apps in Toss** WebView 미니앱

---

## 목차

- [개요](#개요)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
  - [사전 요구사항](#사전-요구사항)
  - [환경변수 설정](#환경변수-설정)
  - [의존성 설치](#의존성-설치)
- [개발 명령어](#개발-명령어)
- [빌드 및 배포](#빌드-및-배포)
  - [웹 빌드](#웹-빌드)
  - [AIT 배포 아티팩트 빌드](#ait-배포-아티팩트-빌드)
  - [배포 흐름](#배포-흐름)
- [환경변수 레퍼런스](#환경변수-레퍼런스)
- [문서](#문서)

---

## 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 고요한 산책 (Quiet Walk) |
| 플랫폼 | Apps in Toss (WebView 미니앱) |
| 앱 ID | `gozneok-lite` |
| 현재 버전 | v0.1.3 |
| 데이터 출처 | 한국관광공사 TourAPI (공공데이터포털) |

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | React 18 + TypeScript |
| 번들러 | Vite 5 |
| 라우팅 | react-router-dom v6 |
| 미니앱 SDK | @apps-in-toss/web-framework |
| API 서버 | Express (Node.js) |
| 패키지 관리 | pnpm 8 (monorepo) |

---

## 프로젝트 구조

```
gozneok-lite/
├── apps/
│   ├── web/          # React WebView 프론트엔드
│   └── api/          # TourAPI 프록시 서버 (Express)
├── docs/             # 설계 문서
├── granite.config.ts # Apps in Toss 미니앱 설정
├── gozneok-lite.ait  # 배포 아티팩트 (ait build 결과물)
└── package.json      # 루트 monorepo 스크립트
```

---

## 시작하기

### 사전 요구사항

- **Node.js** ≥ 18.0.0
- **pnpm** ≥ 8.0.0

```powershell
# pnpm 미설치 시
npm install -g pnpm
```

### 환경변수 설정

```powershell
# API 서버 환경변수
Copy-Item apps/api/.env.example apps/api/.env.local

# 웹 환경변수
Copy-Item apps/web/.env.example apps/web/.env.local
```

`apps/web/.env.local`에서 아래 값을 반드시 설정하세요:

| 변수 | 설명 | 필수 여부 |
|------|------|-----------|
| `VITE_API_BASE_URL` | 프록시 API 서버 URL (로컬 개발 시 생략 가능) | 프로덕션 필수 |
| `VITE_ADMOB_BANNER_GROUP_ID` | 배너 광고 그룹 ID (Toss 파트너 콘솔) | 선택 |
| `VITE_ADMOB_INTERSTITIAL_GROUP_ID` | 전면 광고 그룹 ID | 선택 |
| `VITE_ADMOB_REWARDED_GROUP_ID` | 보상형 광고 그룹 ID | 선택 |

### 의존성 설치

```powershell
pnpm install
```

---

## 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 웹 + API 서버 동시 실행 |
| `pnpm dev:web` | 웹만 실행 (Vite dev server, :5173) |
| `pnpm dev:api` | API 서버만 실행 (:3001) |
| `pnpm lint` | 전체 린트 |
| `pnpm typecheck` | 전체 타입 검사 |

> 로컬 개발 시 Vite proxy가 `/api` 요청을 `http://localhost:3001`로 자동 전달합니다.

---

## 빌드 및 배포

### 웹 빌드

```powershell
# 웹 앱만 빌드 (apps/web/dist/ 생성)
npm run build:web
# 또는
pnpm build:web
```

### AIT 배포 아티팩트 빌드

```powershell
# 웹 빌드 후 .ait 아티팩트까지 한 번에 생성
npm run build:ait
```

> 위 명령은 `pnpm --filter web build && npx ait build` 순서로 실행됩니다.  
> 결과물: 프로젝트 루트의 `gozneok-lite.ait`

### 배포 흐름

```
1. 환경변수 확인 (VITE_API_BASE_URL, VITE_ADMOB_*)
      ↓
2. npm run build:ait   # 웹 빌드 + .ait 생성
      ↓
3. Toss 파트너 콘솔에서 gozneok-lite.ait 업로드
      ↓
4. 심사 제출
```

#### Toss 파트너 콘솔 체크리스트

- [ ] `granite.config.ts`의 `brand.icon` URL을 콘솔 발급 URL로 교체
- [ ] `VITE_API_BASE_URL`을 프로덕션 API 주소로 설정
- [ ] AdMob 그룹 ID를 LIVE 값으로 확인
- [ ] [REVIEW_CHECKLIST.md](./docs/REVIEW_CHECKLIST.md) 전 항목 통과 확인

---

## 환경변수 레퍼런스

### apps/api

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `TOUR_API_BASE_URL` | 내장값 | TourAPI 베이스 URL |
| `TOUR_API_SERVICE_KEY` | 내장값 | TourAPI 서비스 키 (내장값 우선) |
| `TOUR_API_MOBILE_OS` | `ETC` | TourAPI MobileOS 파라미터 |
| `TOUR_API_MOBILE_APP` | `GozneokLite` | TourAPI MobileApp 파라미터 |
| `PORT` | `3001` | API 서버 포트 |

### apps/web

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `VITE_API_BASE_URL` | (없음) | 프록시 API URL — 프로덕션 배포 시 필수 |
| `VITE_ADMOB_BANNER_GROUP_ID` | `ait.v2.live.cc42e4d2cbf54b8d` | 배너 광고 ID |
| `VITE_ADMOB_INTERSTITIAL_GROUP_ID` | (없음) | 전면 광고 ID |
| `VITE_ADMOB_REWARDED_GROUP_ID` | (없음) | 보상형 광고 ID |

---

## 문서

| 문서 | 설명 |
|------|------|
| [docs/PRD_1PAGE.md](./docs/PRD_1PAGE.md) | 제품 요구사항 (1-page) |
| [docs/IA_AND_FLOW.md](./docs/IA_AND_FLOW.md) | 정보 구조 및 화면 흐름 |
| [docs/DATA_MODEL.md](./docs/DATA_MODEL.md) | 데이터 모델 |
| [docs/RECOMMENDATION_RULES.md](./docs/RECOMMENDATION_RULES.md) | Quiet Score 추천 규칙 |
| [docs/API_PROXY_AND_CACHE.md](./docs/API_PROXY_AND_CACHE.md) | 프록시 API 및 캐시 전략 |
| [docs/IAA_ADS_PLAN.md](./docs/IAA_ADS_PLAN.md) | 광고 계획 (IAA) |
| [docs/REVIEW_CHECKLIST.md](./docs/REVIEW_CHECKLIST.md) | Toss 심사 체크리스트 |
| [docs/WBS_DAY1_14.md](./docs/WBS_DAY1_14.md) | 작업 분류 구조 |
| [docs/RISKS_AND_DECISIONS_10.md](./docs/RISKS_AND_DECISIONS_10.md) | 리스크 및 결정 10선 |
| [docs/INDEX.md](./docs/INDEX.md) | 문서 전체 목차 |
