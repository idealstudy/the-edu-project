# 디자인 시스템 정합 갭 (문서 ↔ 코드 ↔ 3역할 hub 프로토타입)

> **[구버전 · 2026-08-11 작업지시서]** SSOT = `mvp-front/docs/DESIGN.md` (v1.2.2+). 이 문서는 v1.2.0 시점의 코드화 작업지시서이며 정본이 아니다. 최신 문서↔코드 정합 갭표는 `docs/mvp-g/design-system-parity-2026-08-12.md`. 삭제하지 않고 이력으로 보존한다.

> 구현 STAMP: 2026-08-11 04:12 KST | line: mvp-g | model: gpt-codex/gpt-5.6-sol | agent: code-builder | skills: 없음 | 근거: `docs/DESIGN.md` v1.2.1, 승인 프로토타입 v22, 이 문서의 T/K/L/P 판정, Tailwind CSS v4·shadcn Button 공식 문서 | 고민: 제품 로직을 건드리지 않으면서 문서가 지정한 오프팔레트만 제거하고, 자동 lint의 실제 제품 위반과 검사기 오탐을 분리했다.
>
> **2026-08-11 코드 반영 상태**: T-1·T-2·T-3·K-2를 반영했고 K-1·L-1·P-1·P-2의 기존 문서 판정을 유지했다. L-2는 이 문서가 명시한 선택 부채라 아키텍처를 바꾸지 않았다. 과제 지정 오프팔레트 hex는 `src/`에서 0건, TypeScript·Vitest 164/164·Next production build는 통과했다. 다만 공용 `design-lint.sh`는 `global\.css`만 제외해 실제 `globals.css` 토큰 정의를 다시 위반으로 세고, 런타임 동적 `style`도 일괄 집계하여 4종 경고가 남는다. 검사기 자체 수정은 이 build 범위 밖이므로 gate는 미통과로 기록한다.

> 감사일 2026-08-11. 정본 문서 `docs/DESIGN.md` v1.2.0, 코드 정본 `src/styles/globals.css`(810줄), 시각 정본 `prototypes/mvp-g-3역할-hub-opus.html`(v22).
> 이 문서는 **다음 단계(코드화·화면 수정)의 작업지시서**다. 화면 자체 수정은 이번 범위 밖이고, 여기서는 "무엇이 어긋났고 코드가 무엇을 바꿔야 하는지"만 짚는다.
> 심각도: **P1**(화면 색·시스템 오염, 지금 보임) · **P2**(토큰 누락·죽은 코드, 유지보수 부채) · **P3**(문서·이름 정합, 위험 낮음).

---

## 요약 (한눈에)

| 축         | 상태 | 핵심 갭 |
| ---------- | ---- | ------- |
| 토큰       | 문서는 v1.2.0에서 코드와 1:1 맞춤. **코드가 문서를 어기는 하드코딩 색 다수(P1)** + 죽은 토큰 1개(P2) |
| 컴포넌트   | ui 35종 실재·일치. **feature 컴포넌트 문서 이름 3개가 코드에 없음(P3)** |
| 레이아웃   | `@/layout` 6부품 실재·일치. 문서에 경로 누락이었음(v1.2.0에서 보강) |
| 프로토타입 | v22가 **토큰에 없는 warm-gray 40여 색을 사용** → 코드 토큰(중립 gray)과 미묘한 색온도 불일치(P2) |

---

## T. 토큰 갭

### T-1 (P1) 시스템 밖 하드코딩 색 — 화면이 토큰을 어긴다

`src/`에서 토큰이 아닌 raw hex를 쓰는 곳. 문서 §2 "브랜드색은 오렌지 하나, 파랑·네이비·임의색 금지"를 어긴다. 코드가 고쳐야 한다(문서가 아니라).

| 파일 | 하드코딩 색 | 문제 | 코드 수정 지시 |
| ---- | ----------- | ---- | -------------- |
| `features/admin-question-bank/components/admin-question-bank.tsx` | `#71717a`·`#e4e4e7`·`#27272a`·`#52525b`·`#fafafa`(Tailwind zinc), `#237a3d`·`#fff7f0`·`#f0a36a` | **다른 회색 계열(zinc) 도입 = 시스템 오염.** d-edu gray 스케일 아님 | zinc → `gray-*` 토큰으로 치환. 초록/오렌지는 `system-success`·`orange-*`로 |
| `features/study-notes/components/learning-management-tab.tsx` | `#747980`·`#eceef0`·`#e3e5e8`·`#d8dbde`(냉회색), `#9a441f`·`#a4481e`·`#e1aa8d`(오프-오렌지) | 냉회색·비표준 오렌지 | `gray-*` / `orange-*` 최근접 토큰으로 치환 |
| `features/course/components/detail/course-detail-client.tsx`, `app/(public)/courses/page.tsx` | `#17130f`·`#e7ddd7` | warm-brown, 팔레트에 없음 | `gray-12`/`gray-3` 또는 신규 토큰 승인 필요(회수 대상 아님, 근사 치환 권장) |
| `shared/components/loading/spinner.tsx` | `#ff4805` | orange-7를 **값으로** 박음 | `var(--orange-7)` 참조로 |
| `shared/components/sidebar/sidebar.tsx` | `#FFF4F1`(=orange-1)·`#e0e0e0`(=gray-3) | 토큰값을 raw로 박음 | 토큰 참조로 |
| `shared/components/drawing/ui/drawing-panel.tsx`·`pdf-panel.tsx` | `#f97316`(Tailwind orange-500)·`#9ca3af` | 브랜드 오렌지 아님 | `orange-*`·`gray-*`로 |
| `app/(home)/list/list-layout-client.tsx` | `#FF5C35`·`#AAAAAA`·`#1A1A1A` | 근사 토큰을 raw로 | `orange-*`/`gray-*`로 |

**승인된 예외(위반 아님)**: 필기 잉크 `#1a3fa0`, 스터디룸 링크카드 `#E9F5FF`/`#0b62b8`, 에디터 펜 팔레트(`toolbar.tsx`), OG 카드 색(`og-card.tsx`, 렌더 이미지 전용). 문서 §2.4에 등재됨.

### T-2 (P1) 상태 텍스트 색이 토큰이 아니다

문서 §2.2가 언급하는 짙은 완료 글자 `#1f6b2c`, 짙은 경고 글자 `#c0281c`(프로토타입 13회 사용)는 **토큰이 없다.** 화면마다 raw로 박히면 드리프트 원천이 된다.
→ **지시**: `--system-success-text: #1f6b2c`, `--system-warning-text: #c0281c`를 globals.css에 신설하고 `@theme`에 `--color-*`로 노출. 문서 §2.5에 추가.

### T-3 (P2) 죽은 토큰 선언

`--color-system-background-alt`가 globals.css에서 두 번 선언(먼저 미정의 `--system-background-alt` 참조 → 이후 `gray-white`로 덮임). 첫 줄(라인 315 부근)은 죽은 코드.
→ **지시**: 첫 선언 제거. (기능 영향 없음, 위생.)

### T-4 (P3) 문서에만 있던 잘못된 토큰 이름 — 해소됨

구 `DESIGN.md`의 `--color-success`/`--color-warning`은 코드에 없다(실제 `--system-success`/`--system-warning`). 문서는 이미 정정됨. 잔여 조치 없음.

---

## K. 컴포넌트 갭

### K-1 (P3) feature 컴포넌트 문서 이름 ↔ 코드 불일치

문서가 개념명으로 부르던 컴포넌트 중 코드에 그 이름이 없는 것:

| 문서 개념명 | 코드 실재 | 조치 |
| ----------- | --------- | ---- |
| `TreeMap` | 트리 컴포넌트군은 있으나 단일 `TreeMap` 아님 | 개념명 유지. 실제 파일명 확정 후 문서 매핑(선택) |
| `CoachChat` | ai-coach 계열 존재, 이름 다름 | 실제 export 이름으로 문서 정정 |
| `DrawingCanvas` | `shared/components/drawing` 배럴 | 실제 export 이름 확인 |
| `StreakBanner` | `open-challenge/.../motive-header.tsx`에 흡수 | 독립 컴포넌트 아님을 문서에 반영(완료) |
| `PointLedger` | **컴포넌트 없음**(포인트 도메인 내 산재) | 필요하면 신설, 아니면 개념명에서 제거 |
| `SolutionShareList` | **컴포넌트 없음** | 필요하면 신설, 아니면 제거 |

→ 위험 낮음. 다음 화면 작업 때 실제 export 이름을 수집해 문서 §6.5 표를 확정한다.

### K-2 (P2) ui 부품 규격 vs 실제 tsx 대조 (미완 — 다음 단계)

문서 §6.1~§6.4 규격(최소 높이·패딩·radius)이 각 cva 정의와 일치하는지 값 대조는 화면 수정 착수 시 완결한다. `button.tsx` 스팟체크로 확인된 실제 갭:

- 대부분 variant는 토큰 사용(`h-control-xl`·`px-button-wide-x`·`rounded-button`·`shadow-cta`·`font-label-heading`). 정합.
- 그러나 `small` variant는 `h-12`(=48px)를 쓴다. 이는 `--spacing-control-*` 토큰(44/50/56/64) 어디에도 없는 값이다. 또 `xlarge`·`medium`·`small`·`xsmall`이 좌우 패딩을 `px-5`·`px-4`(Tailwind 기본 20/16px)로 준다 — `--spacing-button-*-x` 토큰 대신 기본 스케일.
- **지시**: `small`의 48px를 control 토큰으로 흡수(44 또는 50 선택)하고, `px-5`/`px-4`를 버튼 패딩 토큰으로 통일. 나머지 ui 부품도 같은 기준으로 훑는다.

---

## L. 레이아웃 갭

### L-1 (해소) 레이아웃 컴포넌트 경로 누락

문서 §6.6이 `PageLayout`~`ExamWizardLayout`을 나열하면서 경로를 안 줬다. 실제는 `@/layout`(`src/layout/`). v1.2.0에서 경로·역할별 셸 분기(`data-*-shell` 선택자)를 명시. 잔여 조치 없음.

### L-2 (P2) 3역할 셸 분기의 SSOT가 CSS 속성 선택자

학생/선생님/관리자 hub의 사이드바 표시·헤더 숨김·패딩이 globals.css의 `body:has([data-admin-shell])` 등 속성 선택자에 하드코딩돼 있다. 레이아웃 컴포넌트가 아니라 전역 CSS가 소유. 역할이 늘면 CSS를 고쳐야 한다.
→ **지시(선택)**: 역할 셸을 레이아웃 컴포넌트 prop(`role="admin"`)로 승격 검토. 지금은 동작하므로 부채로만 기록.

---

## P. 프로토타입 갭

### P-1 (P2) 프로토타입의 warm-gray가 코드 토큰(중립 gray)과 색온도 불일치

승인 프로토타입 v22는 `#eeece8`·`#efeae6`·`#e6e0da`·`#f2f1ef`·`#f4efef` 등 **따뜻한 회색 40여 종**을 쓴다. 코드 gray 스케일은 순중립(`#f5f5f5`·`#e9e9e9`·`#e0e0e0`…). 즉 프로토타입이 코드보다 미세하게 따뜻하다.
→ **결정 필요 아님(내가 판정)**: 프로토타입의 warm-gray는 개별 화면 실험값이지 시스템 결정이 아니다. **코드 중립 gray를 정본으로 유지**하고, 프로토타입을 정본에 맞춰 읽는다. warm 톤을 시스템으로 승격하려면 별도 `--warm-gray-*` 스케일 신설이 필요한데, 지금은 근거(중립 1161회 사용)가 중립을 지지하므로 승격하지 않는다.

### P-2 (해소) 프로토타입 상태색은 문서와 일치

프로토타입의 `#f0efec`(=tree-untested), `#f0c4c0`(오류 테두리, 문서 §6.4), `#ffd0c0`(tree-weak), `#ff4805`(tree-mastered/primary)는 토큰과 일치. 트리 4단계·오류 상태는 3자 정합.

---

## 다음 단계 착수 순서 (권장)

1. **T-1 zinc 오염부터**(admin-question-bank) — 가장 눈에 띄는 시스템 오염.
2. **T-2 상태 텍스트 토큰 신설** → 이후 화면들이 raw 대신 토큰 참조.
3. **T-3 죽은 토큰 제거**(위생, 저비용).
4. **T-1 나머지 하드코딩 치환**(spinner·sidebar·drawing·list-layout).
5. K-2 ui 부품 값 대조 + K-1 컴포넌트 이름 확정은 화면 수정과 병행.

---

## 구현 결과 (2026-08-11)

| 갭 | 코드 반영 | 직접 검증 |
| --- | --- | --- |
| T-1 | zinc·warm/cold gray·raw orange와 동일값 raw hex를 DESIGN 토큰 참조로 치환 | 과제 지정 오프팔레트 정규식 0건 |
| T-2 | `--system-success-text`, `--system-warning-text`와 Tailwind theme 노출 추가 | `StatChip`·`StatusBadge`가 새 토큰 사용, 단위 테스트 통과 |
| T-3 | 미정의 변수를 가리키던 첫 `--color-system-background-alt` 선언 제거 | 실제 `gray-white` 매핑 한 건만 잔존 |
| K-1 | DESIGN.md의 실재 코드 매핑을 유지 | 소스 컴포넌트 신설 없음 |
| K-2 | Button `small`을 48px에서 `h-control-sm` 44px로 정합, 버튼 좌우 패딩을 전용 토큰으로 통일 | 공용 UI 단위 테스트 6/6 |
| L-2 | 선택 부채로 유지 | 역할 셸 아키텍처·제품 동작 변경 없음 |
| P-1 | 중립 gray 정본 유지 | warm-gray 신규 토큰 0 |

- 유지한 기존 기능: 버튼 클릭·라우팅·API 호출, 역할별 셸, 필기·PDF·에디터 동작, 관리자·과정·학습노트 화면 로직은 변경하지 않았다.
- 추가·변경한 것: 색 참조, 상태 텍스트 토큰, 버튼 높이·패딩 토큰, 정본 문서 버전만 바꿨다.
- 셀프심문: 이 결론이 틀렸다면 가장 그럴듯한 이유는 토큰 치환이 승인 v22의 실제 렌더와 미세하게 달라진 경우다. 브라우저 E2E·스크린샷 대조는 QA 소유이므로 미검증으로 남긴다.
- 레드팀: 엄격한 출고 심사자는 `design-lint` 4종 경고 때문에 거부한다. 따라서 코드 검증 통과와 gate 통과를 분리하고, 검사기 제외 패턴·동적 style 정책이 고쳐질 때까지 배포 근거로 사용하지 않는다.

SKILLS_USED: 없음

SKILLS_SKIPPED: 코드 구현에 직접 매칭되는 설치 스킬 없음.

SOURCES: `docs/DESIGN.md` v1.2.1 · `src/styles/globals.css` · 승인 프로토타입 `prototypes/mvp-g-3역할-hub-opus.html` v22 · https://tailwindcss.com/blog/tailwindcss-v4 · https://ui.shadcn.com/docs/components/base/button

MODEL: gpt-codex/gpt-5.6-sol
