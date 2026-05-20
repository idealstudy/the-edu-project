# mvp-front/docs/frd — Frontend 구현 명세

각 FRD는 단일 기능의 **Frontend 구현 명세**를 한 폴더에 압축한다.

| | 위치 | 책임 |
|---|---|---|
| 추상 (왜·누가·원칙) | `wiki/concepts/X.md` | LLM이 매번 로드, 100k token 한도 |
| Backend 구현 명세 | `mvp-back/docs/frd/<X>/spec.md` | API · Flyway · 엔티티 |
| **Frontend 구현 명세** | **`mvp-front/docs/frd/<X>/spec.md`** | Route · 컴포넌트 · TanStack key · E2E |
| 결정 사유 | `wiki/decisions/ADR-NNNN-*.md` | supersedes로만 무효화 |

---

## 폴더 구조 (ADR-0005)

```
mvp-front/docs/frd/
├── README.md              # ← 이 파일
├── <기능 슬러그>/
│   ├── spec.md            # 8 sections, 60~100줄
│   └── archive/           # versioning 시 v1.x 보관 (.gitkeep)
└── (다음 기능 폴더)
```

Backend FRD와 동일 구조. 한 기능 = 한 폴더.

---

## 인덱스

| 기능 | Frontend FRD | Backend FRD | wiki concept | 상태 | 버전 |
|---|---|---|---|---|---|
| 사고력 답변구조 | [사고력-답변구조/spec.md](사고력-답변구조/spec.md) | [[mvp-back:docs/frd/사고력-답변구조/spec]] | [[wiki/concepts/사고력-답변구조]] | drafted | v1.0 |
| 챌린지식 풀이 | [챌린지식-풀이/spec.md](챌린지식-풀이/spec.md) | [[mvp-back:docs/frd/챌린지식-풀이/spec]] | [[wiki/concepts/챌린지식-풀이]] | drafted | v1.0 |

---

## spec.md 작성 규약

### Spec-Driven Dev 변형 — 8 sections, 60~100줄

가벼움이 핵심. **FRD ≠ 코드**. 코드에 적어야 할 것(JSX, props, hooks 상세)은 FRD에서 제외.

| § | 섹션 | 내용 |
|---|---|---|
| 1 | Problem / Goal | 2~3 sentences. 사용자 pain + 비즈니스 의도 + Success 정의 |
| 2 | User Scenarios | 3~5 concrete flows (페르소나 Student/Teacher/Public/Admin 명시) |
| 3 | Data Contract | Backend FRD §2 API 매칭. request/response JSON shape |
| 4 | FSD Mapping | features/widgets/entities/shared 어느 slice |
| 5 | Edge Cases / Defer | 1차 MVP에서 안 하는 것 (refactor 방지) |
| 6 | Success Metrics | analytics 이벤트명 + funnel (Mixpanel/PostHog/GA4) |
| 7 | Related Specs | Backend FRD + Figma + E2E spec path |
| 8 | Open Questions | 코드 들어가기 전 합의 미해결 |

### Skip (코드와 중복이라 안 적음)

- 전체 route list → `app/` 디렉토리 자체가 명세
- Component prop types → TS 자동완성
- Zustand store shape → TanStack DevTools
- 스타일 가이드 → `tailwind.config.ts`
- 애니메이션 spec → Figma + E2E 검증

### Frontmatter (필수)

```yaml
---
feature: 사고력-답변구조
version: v1.0
status: drafted          # drafted | active | superseded | archived
updated: 2026-05-21
related_wiki_concept: "[[wiki/concepts/사고력-답변구조]]"
related_backend_frd: "[[mvp-back:docs/frd/사고력-답변구조/spec]]"
related_adr: [ADR-0005]
---
```

---

## Versioning 정책 (ADR-0005, 3 시나리오)

| 시나리오 | 절차 |
|---|---|
| **v1.0 → v1.1** (소소한 수정) | spec.md overwrite + frontmatter version 증가 + 변경 이력 표 한 줄 |
| **v1.x → v2.0** (breaking) | 새 ADR + archive/spec-v1.x-YYYY-MM-DD.md mv + 새 spec.md |
| **v2.0 신규 서비스** | 별도 기능 폴더, 양쪽 ACTIVE 동시 |

---

## 갱신 정책

| 시점 | 액션 |
|---|---|
| **PR 게이트** | 구현 PR 만들 때 FRD 갱신 선행. stale이면 review 차단 |
| **code review** | 코드 ↔ FRD 불일치 시 어느 게 진실인지 코멘트 |
| **status 전이** | drafted → active → superseded → archived (mv to archive/) |
| **Backend FRD 역참조** | Frontend FRD §7 Related Specs에 Backend FRD link 유지 |

---

## 위치·구조 결정 근거

| ADR | 결정 |
|---|---|
| [[ADR-0004]] | FRD를 wiki에서 코드 옆으로 (Karpathy nanochat + Spec-Driven Dev) |
| [[ADR-0005]] | 폴더 구조 (`<기능>/spec.md + archive/`) + Frontend Spec-Driven Dev 8 sections + versioning |

## 작성 시점

코드 들어가기 직전. 15~20분 작성 → 백엔드·디자이너·QA 동기 검토 → 구현 진입.
