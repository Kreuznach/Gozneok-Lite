# PRD — Gozneok Lite (1-Page)

## 제품 개요
- **서비스명**: Gozneok Lite
- **플랫폼**: Apps in Toss (WebView 미니앱)
- **목적**: 지금(또는 특정 시간대)에 조용하게 머물기 좋은 장소를 빠르게 추천
- **대상**: 한국인 사용자 (한국어 UI만, 다국어 없음)
- **MVP 단계**: 익명 사용자 기준, 소셜·커뮤니티 기능 없음

---

## 핵심 가치
> "바쁜 일상에서 잠깐 조용한 곳을 찾고 싶을 때, 빠르게 발견하게 해준다."

---

## 기능 범위

### MVP (구현)
| 기능 | 설명 |
|------|------|
| 홈 | 시간대 선택 + 위치/지역 기반 진입 |
| 지역 선택 | 시도 단위 17개 지역 선택 |
| 시간대 선택 | 지금/오전/오후/저녁 |
| 장소 목록 | TourAPI 기반 카드 리스트 (이미지·Quiet Score) |
| 장소 상세 | 사진·소개·주소·투표·위시리스트·길찾기 |
| 위시리스트 | localStorage 기반 저장/조회/삭제 |
| 설정 | 버전·데이터 출처·캐시 리셋·광고 상태 |
| Debug (Dev) | 더미 토글·광고 확인 (프로덕션 숨김) |
| Quiet Score | 베이지안 보정 조용함 지수 (투표 기반) |
| IAA 광고 | 전면형(자연 전환 시) + 보상형(잠금 해제 시) |

### 확장 단계 (MVP 제외)
- 사용자 댓글 / 리뷰 텍스트
- SNS 공유 / 사진 업로드
- 다국어 지원
- 푸시 알림
- 소셜 로그인 / 계정 연동
- 지도 SDK 임베드

---

## 수익화
- **IAA 중심**: 노출형(Banner) + 전면형(Interstitial) + 보상형(Rewarded)
- Apps in Toss AdMob API 사용
- 광고 미지원/실패 시 UX에 영향 없음

---

## 권한 정책
- 앱 첫 진입 시 위치 권한 다이얼로그 사전 요청 (세션당 1회)
- 권한 거부 시 지역 선택 플로우로 즉시 대체
- Toss SDK 미지원 환경에서는 브라우저 Geolocation 폴백

---

## 데이터 출처
- **한국관광공사 TourAPI (KorService2)**
- 공공데이터포털 (data.go.kr)
- 서비스 키는 서버 환경변수에서만 사용

---

## 기술 스택
| 영역 | 기술 |
|------|------|
| 프론트 | Vite + React 18 + TypeScript + `@apps-in-toss/web-framework` 2.x |
| 라우팅 | react-router-dom v6 |
| 상태 | React Context + Hooks (Redux 없음) |
| 스타일 | TDS(Toss Design System) + 인라인 스타일 최소화 |
| API | Node.js(Express) 프록시 서버 |
| 캐시 | 메모리 TTL 캐시 (프론트+서버) |
| 저장 | localStorage (위시리스트·투표·deviceId) |

---

## 완료 기준 (MVP)
- [ ] Home → List → Detail → Vote → Wishlist 플로우 샌드박스에서 동작
- [ ] 위치 거부 시 지역 선택 기반으로 정상 동작
- [ ] 광고 미지원/실패 시 UX 정상
- [ ] TourAPI 오류 시 더미 폴백으로 최소 기능 유지
- [ ] `/docs` 문서 10종 존재
- [ ] TourAPI 키가 어떤 소스 파일에도 없음
