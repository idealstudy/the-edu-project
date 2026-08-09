# CLAUDE.md · mvp-front (프론트엔드 진입점)

Next.js 15 / React 19 / App Router / Tailwind v4 / FSD.

이 파일은 Claude 계열 에이전트의 프론트엔드 작업 진입점이다. 루트 `../CLAUDE.md §3`(읽기 순서 표)의 "프론트엔드 코드 작업" 항목이 여기로 들어온다.

> `AGENTS.md` 와 이 파일은 같은 규칙을 가리킨다. 규칙 본문은 `AGENTS.md` 와 `docs/` 가 소유하고, 이 파일은 진입 순서만 정한다. 충돌하면 `docs/` 의 해당 문서가 정본이다.

---

## 1. 읽는 순서

**코드를 한 줄이라도 쓰기 전에** 아래를 읽는다.

| 순서 | 파일                        | 무엇                                            |
| ---- | --------------------------- | ----------------------------------------------- |
| 0    | `AGENTS.md`                 | 전체 규칙 요약 + 작업 유형별 Quick Reference    |
| 1    | `docs/architecture.md`      | FSD 레이어, 데이터 흐름, API 클라이언트         |
| 2    | `docs/entities.md`          | entities 구조 (API 호출은 전부 여기)            |
| 3    | `docs/features.md`          | features 구조, 레거시 코드 주의점               |
| 4    | `docs/error-handling.md`    | 에러 계층, ApiErrorType                         |
| 5    | `docs/e2e.md`               | Playwright 셋업과 핵심 플로우                   |
| 6    | **`docs/design-system.md`** | **디자인 시스템 정본.** 화면 작업이면 필독      |
| 7    | `docs/ui-guidelines.md`     | UI 코딩 규칙 (컴포넌트·아이콘·a11y·반응형·로딩) |

작업 유형별 최소 조합:

- API 추가·수정 → 1, 2
- 기능 추가·수정 → 1, 3
- **화면·컴포넌트 작업 → 6, 7** (토큰 먼저, 코딩 규칙 다음)
- E2E → 5
- 처음이거나 범위가 넓음 → 전부

---

## 2. 디자인 시스템 (필독)

정본은 **`docs/design-system.md`** 하나다. 코드 정본은 `src/styles/globals.css` 의 CSS 변수와 `@theme` 블록이다.

지켜야 할 최소선:

- **임의 hex 금지.** 색은 `orange-1`~`orange-12`, `gray-1`~`gray-12`, 또는 시맨틱 토큰(`text-text-main` 등).
- **임의 px 금지.** 간격은 `p-card-pad`(16) · `gap-block-gap`(12) · `p-section-gap`(16), 모서리는 `rounded-card`(12) · `rounded-button`(8) · `rounded-pill`, 그림자는 `shadow-cta` · `shadow-popover` 둘뿐.
- **타이포는 `font-*` 유틸 스케일만.** `text-[17px]` 같은 건 위반.
- **터치 타깃 44px.** `min-h-touch-min`.
- `gray-scale-*` · `orange-scale-*` 는 레거시 별칭이다. 새 코드에 쓰지 않는다.
- 공용 부품(`@/shared/components/ui`)이 있으면 원시 `<button>` · `<input>` 을 새로 만들지 않는다. 형태가 부족하면 부품에 variant 를 추가한다.
- 승인된 화면 규격이 있으면 그 수치대로 만든다: `../docs/mvp-g/design-spec-v22.md`.

---

## 3. 작업 규율

루트 `../CLAUDE.md §0` 을 그대로 따른다. 요약:

1. 기능을 만들거나 고치면 **E2E 를 통과시킨 뒤** 보고한다. 추측으로 "됐다"고 하지 않는다.
2. 그다음 관련 문서(`docs/`, `wiki/`)에 반영한다. 디자인 토큰을 추가·변경했으면 `docs/design-system.md` 를 **같은 커밋에서** 고친다.
3. 진행 내용을 `../wiki/ops/session-state.md` 에 남겨 다음 세션이 이어받게 한다.

검증 명령:

```bash
npm run check-types   # 타입 검사 (tsc --noEmit)
npm run lint          # ESLint
npm run test:ci       # 단위 테스트 (vitest run)
npm run build         # production build
```

</content>
