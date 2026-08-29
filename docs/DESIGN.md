---
name: d-edu
version: 1.4.2
release_candidate: mvp-g-v2.0.2
canonical_prototype: prototypes/mvp-g-3역할-hub-v24.2-gpt-codex-20260829-1054.html
tokens:
  colors:
    background: "#ffffff"
    surface: "#ffffff"
    text_primary: "#222222"
    text_secondary: "#5f5f5f"
    brand: "#ff4805"
    brand_filled: "var(--orange-9)"
    border: "var(--gray-5)"
    success: "var(--system-safe)"
    warning: "var(--warning)"
    danger: "var(--red-9)"
  typography:
    body: "Wanted Sans Variable, Pretendard Variable, sans-serif"
    display: "Wanted Sans Variable, Pretendard Variable, sans-serif"
    body_size: "14px"
    body_line_height: "1.6"
  spacing: [4, 8, 12, 16, 24, 32, 48]
  radius:
    control: "8px"
    card: "12px"
    pill: "999px"
  layout:
    mobile: "390px, 1 column"
    tablet: "1024px, sidebar 260px"
    desktop: "1280px, sidebar 260px"
---

# 디에듀 디자인 시스템 (정본)

> 이 문서가 프론트엔드 디자인 시스템의 **유일한 정본**이다.
> 코드 정본은 `src/styles/globals.css`(CSS 변수 + Tailwind v4 `@theme`)이고, 이 문서는 그 값의 뜻과 쓰는 법을 적는다.
> 값이 서로 다르면 `globals.css` 가 이긴다. 발견 즉시 이 문서를 고친다.

| 항목        | 값                                                                                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 버전        | v1.4.2                                                                                                                                                    |
| 갱신        | 2026-08-29                                                                                                                                                |
| 작성자      | product-designer (gpt-codex)                                                                                                                              |
| 출고 후보   | MVP-G v2.0.2                                                                                                                                               |
| 변경        | v1.4.2 MVP-G v24.2 RETAKE. 관리자 문제은행 모바일을 실제 1열로 잠그고 문항 본문 읽기 폭, 44px 행동, 자동 줄바꿈 계약을 추가. YAML 토큰과 표준 8절 라우팅을 추가. |
| 코드 정본   | `mvp-front/src/styles/globals.css`                                                                                                                        |
| 디자인 정본 | `prototypes/mvp-g-3역할-hub-v24.2-gpt-codex-20260829-1054.html`                                                                                          |
| 통합한 문서 | `docs/design-system-2.0.md`(2.0 톤·컴포넌트) · `docs/ui-guidelines.md §7`(색 우선순위) · `docs/mvp-g/design-spec-v24.2-gpt-codex-20260829-1054.md`(현행 수치 규격) |
| 관련        | `docs/ui-guidelines.md`(UI 코딩 규칙) · `wiki/5-hubs/hub-design/design-system.md`(디자인 조직 관점 요약)                                                |
| 코드 갭     | `docs/mvp-g/design-system-conformance-gap.md`(과거 정합 갭 이력)                                                                                         |

> **정본 위치 (2026-08-11 단일화)**
> 같은 기간에 두 세션이 각자 디자인 시스템을 통합해 `DESIGN.md` 가 두 곳에 생겼다(레포 루트 · 여기).
> 정본이 둘이면 서로 다른 값을 보고 개발하게 되므로 **이 파일 하나로 합쳤다.**
> 레포 루트 `DESIGN.md` 는 이 파일을 가리키는 포인터로 축소했다.
> 이 파일에 없던 절(개요·착수 순서·레이아웃·높이와 겹침 순서·해야 할 것과 하지 말 것)은 루트본에서 그대로 옮겼다.

> **v1.2.0 정합 감사 (2026-08-11).** globals.css 810줄과 `src/` 실사용을 전수 대조해 문서를 코드 현행에 맞췄다. 바뀐 것: ①시스템 색에 `--system-safe`·`--system-dim`·`--surface-coach-*` 추가 §2.5 ②2.0 시맨틱 색 토큰(`--color-text-*`·`--color-line-*`·`--color-background-*`·`--color-key-color-*`)을 §2.6으로 명시(전엔 §1이 존재만 언급) ③간격 토큰 전량 수록 §4.2(전엔 약 20개만) ④모서리에 `--radius-control-compact`·`--radius-section` 추가 ⑤레이아웃 컴포넌트 import 경로 `@/layout` 명시 ⑥feature 컴포넌트 목록을 코드 실재와 대조해 정정 §6.5. 미해소 불일치는 갭 문서로 이관.

## Overview

브랜드는 진중한, 동기부여형, 정직한 세 형용사를 쓴다. 진중함은 흰 표면과 절제된 경계로, 동기부여는 오렌지 주 행동 하나로, 정직함은 필터 문맥과 실제 결과 수를 함께 표시하는 방식으로 구현한다. 상세 원칙과 용어는 `## 0. 개요`, `## D-EDU 고정값`, `## 8. 톤과 안티룰`이 소유한다.

## Colors

YAML의 역할 토큰이 빠른 파싱 정본이고 실제 값은 `src/styles/globals.css`가 이긴다. 전체 단계와 의미색 적용은 `## 2. 색`에 있다. 오렌지는 주 행동과 정복 상태에만 쓰고, 성공·경고·위험은 의미가 있을 때만 쓴다.

## Typography

본문과 디스플레이는 Wanted Sans Variable과 Pretendard Variable을 사용한다. 크기, 굵기, 행간의 전체 단계와 실제 utility 대응은 `## 3. 타이포`가 소유한다. 한국어 본문은 `word-break: keep-all`과 `overflow-wrap: break-word`를 함께 써 어절을 보존한다.

## Layout

390px은 1열, 1024px과 1280px은 260px 사이드바 다음에 본문이 오는 `flex-row`다. 8pt 계열 간격과 상세 그리드는 `## 4. 간격`, `## 7. 반응형`, `## 10. 레이아웃`이 소유한다. 관리자 문제은행의 보조 패널도 390px에서는 문항 목록 다음의 1열로 접어야 하며 inline 열 정의로 모바일 규칙을 덮지 않는다.

## Elevation & Depth

기본 카드는 경계로 층을 나누고 그림자는 강조 팝오버와 고정 내비게이션에만 사용한다. 레이어와 z-index 전체 계약은 `## 5. 모서리와 그림자`, `## 11. 높이와 겹침 순서`가 소유한다.

## Shapes

컨트롤 8px, 카드 12px, 배지와 칩 999px을 사용한다. 전체 radius와 border 조합은 `## 5. 모서리와 그림자`와 부록 `## 4. 형태`가 소유한다.

## Components

버튼, 입력, 카드, 모달·시트, 목록 행, 빈 상태, 토스트·알림, 앱 셸의 토큰과 상태는 `## 6. 공용 부품 규격`이 소유한다. 문제은행 모바일 문항 행은 `26px 번호 + minmax(0,1fr) 본문` 1열 그리드이며 상태·보기 행동은 본문 아래로 접고 모든 버튼은 최소 44px이다.

## Do's and Don'ts

한 화면 한 주 행동, 실제 도메인 수치, 필터 문맥과 결과 수 일치를 지킨다. 보라 그라디언트, 장식 blob, 의미 없는 3카드, 대상 없는 CTA, `HIGH_3` 문제은행 필터, inline 데스크톱 열로 모바일 1열을 덮는 패턴을 금지한다. 전체 목록은 `## 12. 해야 할 것과 하지 말 것`, `### 13.5 금지 패턴`이 소유한다.

**왜 파일 이름에 버전을 안 붙였나.** 기존에 `design-system-2.0.md` 가 정본이었는데 `ui-guidelines.md` 가 "3.0 우선"을 선언하면서 존재하지 않는 3.0 문서를 가리켰다. 파일 이름에 세대를 박으면 세대가 오를 때마다 정본이 갈라진다. 이제 파일은 하나로 고정하고, 세대 차이는 문서 **안**의 절로 다룬다.

---

## 0. 개요

| 항목 | 원칙 |
| ---- | ---- |
| 한 줄 | **제대로 풀면 내 지도가 오렌지로 채워진다.** 트리, 숫자, 보상은 이 문장을 섬긴다 |
| 톤 | **진중한 · 동기부여형 · 정직한.** 여백과 타입 위계를 지키고, 막연한 격려 대신 실제 숫자를 보여준다 |
| 브랜드 색 | **오렌지 하나.** 비텍스트 포인트와 약점 트리 정복색은 `#ff4805` (`--orange-7`), 흰 글자가 있는 채운 버튼은 대비를 위해 `orange-9`를 쓴다 |


## 착수 순서

1. `/Users/sj/.claude/standards/design.md`에서 전 제품 공통 품질헌법과 합격선을 읽는다.
2. 이 파일 `DESIGN.md`에서 D-EDU 고정값, 토큰, 공용 부품 계약을 읽는다.
3. 작업 유형에 맞는 상세 문서를 읽는다.

| 작업 유형 | 상세 문서 |
| --------- | --------- |
| 화면과 컴포넌트 구현 | `mvp-front/docs/ui-guidelines.md` |
| 프로토타입 제작과 검수 | `prototypes/PROTOTYPE-HARNESS.md` |
| 승인 시안 확인 | 대상 `pipeline-state*.md`의 `approved_artifacts.design_hub` 핀. 경로를 추측하거나 문서에 고정하지 않는다 |
| MVP-G 이행 배경 확인 | `docs/mvp-g/design-system-migration-v1.md` (이행 기록이며 정본이 아님) |


## D-EDU 고정값

| 항목 | 잠긴 값 | 화면에서의 뜻 |
| ---- | ------- | ------------- |
| 기준 기기 | **태블릿 퍼스트** | 1024×768 가로를 먼저 확정하고 데스크톱, 휴대폰 순서로 적응시킨다 |
| 등급 스케일 | **1~9 (9등급 상대평가)** | 예상 등급·등급 범위·등급 게이지는 **모두 1(최상)~9(최하) 9단계**로 그린다. 눈금·구간·범위 막대·라벨을 1~5로 자르지 않는다 |

### 등급 스케일 잠금 (도메인 규칙)

디에듀의 예상 등급은 **모의고사·수능 기준**이다. 한국 수능(국어·수학·탐구)은 상대평가 **9등급제**를 유지한다([교육부 2028 대입개편](https://happyedu.moe.go.kr/happy/bbs/selectHappyArticle.do?bbsId=BBSMSTR_000000005240&nttId=38915)). 2028부터 5등급으로 바뀌는 것은 **학교 내신뿐**이고, 이 화면이 다루는 모의고사 예상 등급은 9등급 그대로다.

- 등급을 시각화하는 모든 부품(예상 등급 게이지·등급 범위 막대·눈금 라벨)은 **1~9 전 구간**을 그린다. 눈금은 `1 2 3 4 5 6 7 8 9` 아홉 칸.
- 등급은 항상 **범위(low~high)** 로 말한다. 단일 등급 단정 금지(문항 수가 단일 등급을 보증하지 못함).
- 게이지 규격은 §6.3.1.
- **해결됨(2026-08-29 확인)**: `features/dashboard/components/student/exam-hall-card.tsx`는 `GRADE_MAX = 9`와 9칸 눈금을 사용한다. 승인 v22의 1~5 표기는 v24에서 1~9로 승격했다.

### 용어 잠금

| 고정 용어 | 뜻 | 바꾸지 말 것 |
| --------- | -- | ------------ |
| 약점 트리 | 과목별 단원 정복도를 누적하는 제품 시그니처 | 학습 지도, 성장 지도처럼 화면마다 다른 이름 |
| 정복도 | 내가 푼 문제를 기준으로 한 단원별 비율 | 진도율, 숙련도와 혼용 |
| 자력 정답 | 힌트와 AI 코치 사용 여부와 무관하게, 정답 해설을 보기 전에 맞힌 것 | 힌트 없이 맞힘 |
| 미진단 · 약점 · 진행 · 정복 | 약점 트리의 고정 4단계 | 임의의 5단계나 다른 단계명 |
| 모의 | 모의고사 자기신고분에 붙이는 작은 태그 | 별도 색이나 빗금 상태 |
| AI 코치 | 답을 바로 주지 않고 사고를 돕는 코치 | 챗봇, 정답 봇과 혼용 |

## 목차

- 0. 개요
- 착수 순서
- D-EDU 고정값
- 1. 세대 정리 (2.0 대 3.0)
- 2. 색
- 3. 타이포
- 4. 간격
- 5. 모서리와 그림자
- 6. 공용 부품 규격
- 7. 반응형
- 8. 톤과 안티룰
- 9. 토큰을 새로 만들 때
- 10. 레이아웃
- 11. 높이와 겹침 순서
- 12. 해야 할 것과 하지 말 것
- 부록 A. 2.0 리디자인 결정 배경 (구 design-system-2.0.md 병합, 이력 보존)

## 1. 세대 정리 (2.0 대 3.0)

색 스케일이 두 벌 있었다. 이제 관계를 이렇게 고정한다.

| 구분            | 이름                                                                    | 지위                                                        |
| --------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| 3.0 원시 스케일 | `--gray-1`~`--gray-12`, `--orange-1`~`--orange-12`                      | **정본.** 새 코드는 이것만 쓴다                             |
| 2.0 원시 스케일 | `--gray-scale-gray-*`, `--orange-scale-orange-*`                        | **레거시 별칭.** 3.0 값을 가리키는 껍데기. 새로 쓰지 않는다 |
| 2.0 시맨틱 토큰 | `--color-text-main`, `--color-line-line1`, `--color-background-gray` 등 | **유지.** 3.0 에 대응이 없는 의미 계층이라 계속 쓴다        |
| 시스템 색       | `--system-success`, `--system-warning`, `--system-background` 등        | **유지**                                                    |

3.0 을 정본으로 고른 이유는 취향이 아니라 실사용량이다. `src/` 안 사용 횟수를 세면 `gray-N` 1161회 대 `gray-scale-gray-N` 207회, `orange-N` 550회 대 `orange-scale-orange-N` 74회다. 승인 프로토타입 v22 의 색 규격도 3.0 값과 일치한다.

**두 스케일의 값이 미묘하게 달랐던 쌍** (전부 3.0 값으로 통일했다. 육안 구분이 불가능한 1 단위 차이라 화면 변화 없음):

| 2.0 이름                   | 구 값     | 3.0 이름      | 채택 값   |
| -------------------------- | --------- | ------------- | --------- |
| `--gray-scale-gray-80`     | `#4e4e4e` | `--gray-10`   | `#4f4f4f` |
| `--orange-scale-orange-10` | `#ffd6cc` | `--orange-3`  | `#ffd6cb` |
| `--orange-scale-orange-40` | `#ff724e` | `--orange-6`  | `#ff714e` |
| `--orange-scale-orange-70` | `#d03800` | `--orange-9`  | `#d13800` |
| `--orange-scale-orange-90` | `#9a2900` | `--orange-11` | `#9b2900` |

2.0 이름은 **지우지 않았다.** 207회 + 74회가 아직 코드에 살아 있어서 지우면 화면이 깨진다. 정본을 가리키는 별칭으로만 남겼다.

### 이름이 틀린 채 문서에 돌던 토큰

구 `design-system-2.0.md` 는 성공색을 `--color-success`, 경고색을 `--color-warning` 으로 적었는데 **코드에 그런 이름은 없다.** 실제 이름은 아래와 같다.

| 문서에 있던 잘못된 이름 | 실제 이름                                           |
| ----------------------- | --------------------------------------------------- |
| `--color-success`       | `--system-success` (유틸리티 `text-system-success`) |
| `--color-warning`       | `--system-warning` (유틸리티 `text-system-warning`) |

---

## 2. 색

브랜드색은 **오렌지 하나**다. 파랑, 네이비, 임의 그라데이션은 금지다.

### 2.1 스케일

| 스케일 | 값                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 오렌지 | `1 #fff4f1` · `2 #ffe7e2` · `3 #ffd6cb` · `4 #ffbaa9` · `5 #ff957b` · `6 #ff714e` · `7 #ff4805` · `8 #e83600` · `9 #d13800` · `10 #b93100` · `11 #9b2900` · `12 #561700`                                     |
| 회색   | `white #ffffff` · `1 #f5f5f5` · `2 #e9e9e9` · `3 #e0e0e0` · `4 #c8c8c8` · `5 #bcbcbc` · `6 #adadad` · `7 #999999` · `8 #7c7c7c` · `9 #666666` · `10 #4f4f4f` · `11 #333333` · `12 #1a1a1a` · `black #000000` |

### 2.2 역할별 쓰임 (대비 기준 포함)

| 용도                                   | 토큰                                                                                                | 근거                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Primary (비텍스트: 게이지·막대·아이콘) | `orange-7`                                                                                          | 브랜드 키컬러                                                        |
| 채워진 버튼 배경 (흰 글자)             | `orange-9`, 테두리 `orange-10`                                                                      | `orange-7` 은 흰 글자 대비 3.4:1 이라 **금지**. `orange-9` 는 4.91:1 |
| 옅은 배경                              | `orange-1`                                                                                          |                                                                      |
| 본문 글자                              | `gray-12`                                                                                           |                                                                      |
| 14px 미만 캡션 글자                    | `gray-9` (5.74:1)                                                                                   | `gray-8` 은 4.17:1 이라 **금지**                                     |
| 선                                     | `gray-3`                                                                                            | 카드 테두리                                                          |
| 페이지 배경                            | `--system-background` `#fcfbfa`                                                                     |                                                                      |
| 성공·완료                              | `--system-success` `#34c759` / `--system-success-alt` `#dcf9e3` / `--system-success-text` `#1f6b2c` | 완료 칩은 `-alt` 배경 + `-text` 글자                                 |
| 경고·오답                              | `--system-warning` `#ff4040` / `--system-warning-alt` `#ffd9d9` / `--system-warning-text` `#c0281c` | 경고 칩은 `-alt` 배경 + `-text` 글자                                 |
| 포커스 링                              | `orange-7` 2px, offset 2px, radius `--radius-focus`                                                 | `@utility focus-ring`                                                |

### 2.3 약점 트리 4단계 (시그니처)

정복도를 오렌지 농도 한 축으로 표현한다. 파랑·빨강을 쓰지 않는다.

| 단계   | 토큰              | 값        |
| ------ | ----------------- | --------- |
| 미진단 | `--tree-untested` | `#f0efec` |
| 약점   | `--tree-weak`     | `#ffd0c0` |
| 진행   | `--tree-progress` | `#ff7a4d` |
| 정복   | `--tree-mastered` | `#ff4805` |

- 노드마다 정복도 % 를 항상 표시한다. 자력 정답 기준.
- 모의고사 자기신고분은 색 단계는 같게 두고 작은 "모의" 태그로 구분한다. 빗금은 폐기했다.
- 반복 막힘은 `⚠` 마커로만 표시하고 노드 색은 바꾸지 않는다.

### 2.3.1 나와 상대 구분 (도전장·대결 화면)

상대를 파랑으로 칠하지 않는다. 브랜드색은 오렌지 하나이고, "상대"라는 말이 붙는 화면은 계속 늘어나므로 색을 하나 더 열면 시스템 색이 두 개가 된다.

| 자리        | 나                                                | 상대                                |
| ----------- | ------------------------------------------------- | ----------------------------------- |
| 진행 막대   | `orange-7` 채움                                   | `gray-8` 채움                       |
| 완료 막대   | `--system-success-text` 채움                      | `gray-10` 채움                      |
| 이름표      | `gray-12` · 굵기 800 (항상 표시)                  | `gray-9` · 굵기 700 (항상 표시)     |
| 결과 배지   | 승 `orange-1` 바탕, 패 `--tree-untested` 바탕     | 무 `gray-3` 바탕 + `gray-11` 글자   |

- **색만으로 구분하지 않는다.** 이름표를 항상 붙이고, 굵기와 농도로 한 번 더 가른다.
- 상대 막대를 "연하게"로 처리하지 않는다. 흐리면 상대가 없는 사람처럼 읽혀 겨루는 화면의 뜻이 죽는다. 회색이되 진하기는 내 막대와 대등하게 둔다.

### 2.4 허용된 시스템 밖 색 (예외 목록)

"키컬러 밖 색 0개"가 합격선이지만 아래 둘은 승인된 예외다. 이 목록에 없는 하드코딩 색은 위반이다.

| 자리                    | 값                                                  | 사유                                   |
| ----------------------- | --------------------------------------------------- | -------------------------------------- |
| 스터디룸 수업 링크 카드 | 배경 `#E9F5FF` · 글자 `#0b62b8`                     | 기존 구현 계승분. 정리 대상            |
| 손글씨 잉크             | `#1a3fa0` (토큰 `--ink-handwriting`)                | 필기 표현 전용. hex 직접 입력 금지     |
| 필기 펜 팔레트          | 에디터 툴바 펜 색(`#FF4040`·`#FFA425`·`#EE38FF` 등) | 사용자가 고르는 잉크색. 시맨틱 색 아님 |

### 2.5 시스템 색 (전체)

`--system-*`·`--surface-*`는 상태·표면 전용 색이다. globals.css `:root`가 정본.

| 토큰                       | 값                         | 쓰임                         |
| -------------------------- | -------------------------- | ---------------------------- |
| `--system-background`      | `#fcfbfa`                  | 페이지 배경                  |
| `--system-background-alt`  | `= gray-white`             | 카드·표면 배경(body 기본)    |
| `--system-dim`             | `#0000004d`                | 딤 오버레이(모달 뒤)         |
| `--system-safe`            | `#aad800` / `-alt #eaffbd` | 안전·연두 상태(라임)         |
| `--system-success`         | `#34c759` / `-alt #dcf9e3` | 성공·완료                    |
| `--system-success-text`    | `#1f6b2c`                  | 성공·완료 상태의 짙은 글자   |
| `--system-warning`         | `#ff4040` / `-alt #ffd9d9` | 경고·오답                    |
| `--system-warning-text`    | `#c0281c`                  | 경고·오답 상태의 짙은 글자   |
| `--system-success-line`    | `#cfe8d5`                  | 완료 칩 테두리               |
| `--surface-coach-paper`    | `#fffdf6`                  | 코치 말풍선 종이 표면        |
| `--surface-coach-solution` | `#fffdf3`                  | 코치 풀이 표면               |
| `--line-coach-paper`       | `rgb(255 92 53 / 0.08)`    | 코치 종이 왼쪽 오렌지 여백선 |
| `--line-coach-edge`        | `#f0e6cf`                  | 코치 말풍선 테두리           |
| `--surface-wrong-chip`     | `#fceeee`                  | 오답 칩 배경                 |
| `--surface-wrong-soft`     | `#fdf5f5`                  | 잠긴 결과 상자 배경          |
| `--surface-wrong-paper`    | `#fffafa`                  | 오답 노트 종이 표면          |
| `--line-wrong-rule`        | `#f6e6e6`                  | 오답 노트 줄                 |
| `--line-wrong-edge`        | `#f0cccc`                  | 오답 노트 테두리             |
| `--surface-skeleton`       | `#f2f1ee`                  | 불러오는 중 자리표시(짙은 쪽) |
| `--surface-skeleton-alt`   | `#f7f6f4`                  | 불러오는 중 자리표시(옅은 쪽) |
| `--ink-handwriting`        | `#1a3fa0`                  | 필기 잉크(§2.4 승인 예외)    |

오답 종이 계열은 "틀린 풀이 표현" 전용이다. 경고 칩·경고 문구에는 `--system-warning-*` 을 쓴다.
불러오는 중 자리표시는 두 색을 좌우로 흘려 한 덩어리로 쓴다. 화면마다 각자 회색을 정하지 않는다.

### 2.6 2.0 시맨틱 색 토큰 (의미 계층, 유지)

3.0 원시 스케일 위에 얹힌 **의미 이름** 층이다. 코드 850+회 사용 중이라 유지한다. 새 코드는 의미가 분명하면 이쪽(예: `text-text-main`)을, 아니면 원시 스케일(`text-gray-12`)을 쓴다. 값은 원시 스케일을 가리키는 별칭이다.

| 토큰                          | 가리키는 값  | 쓰임             |
| ----------------------------- | ------------ | ---------------- |
| `--color-text-main`           | `gray-12`    | 본문 글자        |
| `--color-text-sub1`           | `gray-10`    | 보조 글자 1      |
| `--color-text-sub2`           | `gray-8`     | 보조 글자 2      |
| `--color-text-inactive`       | `gray-5`     | 비활성 글자      |
| `--color-text-reversed-main`  | `gray-white` | 어두운 배경 글자 |
| `--color-line-line1`          | `gray-3`     | 옅은 선          |
| `--color-line-line2`          | `gray-5`     | 중간 선          |
| `--color-line-line3`          | `gray-black` | 강조 선          |
| `--color-background-gray`     | `gray-1`     | 회색 면          |
| `--color-background-orange`   | `orange-1`   | 옅은 오렌지 면   |
| `--color-background-inactive` | `gray-3`     | 비활성 면        |
| `--color-key-color-primary`   | `orange-7`   | 키컬러(비텍스트) |
| `--color-key-color-secondary` | `orange-3`   | 키컬러 보조      |
| `--color-key-color-tertiary`  | `orange-12`  | 키컬러 강조      |
| `--color-ring`                | `orange-7`   | 포커스 링        |

---

## 3. 타이포

Wanted Sans Variable을 본문 1순위로 쓰고, 로컬 Pretendard를 대체 글꼴로 둔다. CDN이 차단되거나 오프라인이어도 Pretendard로 같은 굵기 계층을 유지한다. **임의 px 금지.** 아래 `@utility` 스케일로만 쓴다.

| 유틸                                | 크기 / 굵기   | 용도        |
| ----------------------------------- | ------------- | ----------- |
| `font-display-1` / `font-display-2` | 56 · 40 / 700 | 랜딩 히어로 |
| `font-title-heading`                | 32 / 700      | 화면 타이틀 |
| `font-headline1-heading`            | 24 / 700      | 섹션 헤딩   |
| `font-headline2-heading`            | 20 / 600      | 하위 섹션   |
| `font-body1-heading`                | 18 / 600      | 카드 제목   |
| `font-body2-heading`                | 16 / 600      | 본문 강조   |
| `font-label-heading`                | 14 / 600      | 라벨·버튼   |
| `font-caption-heading`              | 12 / 500      | 캡션·메타   |

v22가 부품 단위로 고정한 예외 글자 크기는 `text-ui-compact` 10.5px(배지·관리자 표 머리), `text-ui-choice` 11.5px(선택 칩), `text-coach` 13.5px(코치 말풍선) 세 개뿐이다. 일반 본문에 새 크기를 만들지 않는다.

추가 규칙 (승인 프로토타입 v22 §1.2):

- 자간: 제목 `-0.03em`, 본문 `-0.015em`, 캡션 `0`. 큰 숫자는 `-0.04em`~`-0.05em`.
- 행간: 제목 1.25, 본문 1.35.
- 숫자(퍼센트·점수·건수)는 전부 `tabular-nums`.
- 한국어 제목은 `word-break: keep-all`. 단어 중간에서 끊지 않는다.
- 문제 본문은 `ui-serif, Georgia, serif` 로 본문 산세리프와 구분한다.
- 학생 손풀이 미리보기처럼 실제 필기를 재현하는 영역만 `Nanum Pen Script` 22px / 행간 28px를 쓸 수 있다. 코치 말풍선에는 적용하지 않는다.

### 3.1 텍스트 안전 유틸리티

| 유틸                | 계약                                                    | 쓰는 곳                |
| ------------------- | ------------------------------------------------------- | ---------------------- |
| `text-heading-wrap` | 한국어 단어를 보존하되 긴 단어는 컨테이너 안에서 줄바꿈 | 제목                   |
| `text-single-line`  | 1줄 말줄임, `min-width:0` 포함                          | 목록 제목·앱바 이름    |
| `text-two-lines`    | 2줄 말줄임 + 긴 단어 줄바꿈                             | 카드 설명              |
| `text-three-lines`  | 3줄 말줄임 + 긴 단어 줄바꿈                             | 긴 요약                |
| `text-break-safe`   | URL·긴 영문을 컨테이너 안에서 강제 줄바꿈               | 사용자 입력·API 메시지 |
| `numeric-tabular`   | `font-variant-numeric: tabular-nums`                    | 점수·퍼센트·건수·시간  |

코치 말풍선은 전용 손글씨를 쓰지 않는다. 앱 본문을 상속하고 종이색, 줄노트 배경, 왼쪽 오렌지 여백선만 남긴다. 수식은 KaTeX 글꼴 예외를 유지한다. 학생이 직접 쓴 손풀이 캔버스는 이 규칙의 대상이 아니다.

---

## 4. 간격

`@theme` 의 `--spacing-*` 로 노출돼 있어 Tailwind 유틸리티로 바로 쓴다 (`p-card-pad`, `gap-block-gap`, `min-h-touch-min` 등).

| 토큰                           | 값    | 뜻                          | 유틸 예             |
| ------------------------------ | ----- | --------------------------- | ------------------- |
| `--spacing-card-pad`           | 16px  | 카드 안쪽 여백              | `p-card-pad`        |
| `--spacing-card-pad-mobile`    | 14px  | 휴대폰 390 카드 안쪽 여백   | `p-card-pad-mobile` |
| `--spacing-block-gap`          | 12px  | 카드 사이 간격              | `gap-block-gap`     |
| `--spacing-section-gap`        | 16px  | 구획(본문 영역) 여백        | `p-section-gap`     |
| `--spacing-section-gap-mobile` | 14px  | 휴대폰 구획 여백            |                     |
| `--spacing-row-gap`            | 7px   | 목록 행 사이 간격           | `gap-row-gap`       |
| `--spacing-inline-gap-xs`      | 5px   | 페이지네이션·문항 격자      | `gap-inline-gap-xs` |
| `--spacing-inline-gap`         | 6px   | 행 안의 액션 두 개          | `gap-inline-gap`    |
| `--spacing-content-gap`        | 8px   | 타일·콘텐츠 묶음            | `gap-content-gap`   |
| `--spacing-grid-gap`           | 11px  | 문제·수업 카드 격자         | `gap-grid-gap`      |
| `--spacing-column-gap`         | 16px  | 2단 배치 열 간격            | `gap-column-gap`    |
| `--spacing-room-gap`           | 20px  | 스터디룸 좌우 영역          | `gap-room-gap`      |
| `--spacing-exam-layout-gap`    | 13px  | 시험 응시·열기 2단 간격     |                     |
| `--spacing-exam-rail`          | 248px | 시험 응시 펼친 레일         |                     |
| `--spacing-exam-rail-folded`   | 56px  | 시험 응시 접힌 레일         |                     |
| `--spacing-exam-wizard-aside`  | 300px | 선생님 시험 열기 보조열     |                     |
| `--spacing-empty-pad-x`        | 22px  | 빈 상태 가로 여백           | `px-empty-pad-x`    |
| `--spacing-empty-pad-y`        | 38px  | 빈 상태 세로 여백           | `py-empty-pad-y`    |
| `--spacing-touch-min`          | 44px  | 터치 타깃 최소              | `min-h-touch-min`   |
| `--spacing-control-sm`         | 44px  | 작은 버튼·선택 칩 최소 높이 |                     |
| `--spacing-control-lg`         | 50px  | 큰 CTA 최소 높이            |                     |
| `--spacing-chip-min`           | 32px  | 앱바 칩 최소 높이           |                     |
| `--spacing-badge-min`          | 22px  | 배지 최소 높이              |                     |
| `--spacing-row-min`            | 58px  | 목록 행 최소 높이           |                     |

셸·부품 치수 토큰(위 표에 없던 나머지 전량). 화면이 이 값을 raw px로 다시 쓰지 않는다.

| 토큰                               | 값             | 뜻                                |
| ---------------------------------- | -------------- | --------------------------------- |
| `--spacing-header-height`          | 60px           | 전역 헤더 높이                    |
| `--spacing-sidebar-width`          | 260px          | 사이드바 폭                       |
| `--spacing-grid-margin`            | 20px           | 그리드 좌우 여백                  |
| `--spacing-appbar-pad-x/y`         | 22 / 13px      | 앱바 안쪽 여백                    |
| `--spacing-sidebar-pad-x/y`        | 12 / 16px      | 사이드바 안쪽 여백                |
| `--spacing-room-page-pad`          | 32px           | 스터디룸 페이지 여백              |
| `--spacing-room-page-pad-mobile`   | 24px           | 스터디룸 휴대폰 여백              |
| `--spacing-control-xs/md/xl`       | 40 / 56 / 64px | 제어 높이(구 xsmall/medium/large) |
| `--spacing-button-compact-x`       | 13px           | 작은 버튼 좌우 패딩               |
| `--spacing-button-default-x`       | 20px           | 기본·CTA 버튼 좌우 패딩           |
| `--spacing-button-wide-x`          | 26px           | 넓은 버튼 좌우 패딩               |
| `--spacing-button-chip-x`          | 14px           | 선택 칩 좌우 패딩                 |
| `--spacing-empty-cta`              | 46px           | 빈 상태 CTA 높이                  |
| `--spacing-flat-row`               | 66px           | 납작 행 높이                      |
| `--spacing-page-max`               | 1180px         | 페이지 최대 폭                    |
| `--spacing-content-max`            | 1100px         | 콘텐츠 최대 폭                    |
| `--spacing-room-aside`             | 360px          | 스터디룸 좌측 폭                  |
| `--spacing-room-content-max`       | 740px          | 스터디룸 우측 최대 폭             |
| `--spacing-answer-box-min`         | 84px           | 답안 입력 최소 높이               |
| `--spacing-level-bar`              | 9px            | 레벨 막대 높이                    |
| `--spacing-tree-progress-max`      | 220px          | 트리 진행바 최대 폭               |
| `--spacing-tree-tile-min`          | 74px           | 트리 타일 최소 크기               |
| `--spacing-dialog-sm`              | 400px          | 작은 다이얼로그 폭                |
| `--spacing-dialog-viewport-offset` | 4rem           | 다이얼로그 뷰포트 여백            |
| `--spacing-tag-menu`               | 300px          | 태그 메뉴 폭                      |
| `--spacing-tag-item`               | 120px          | 태그 항목 폭                      |
| `--spacing-tag-pad-y`              | 10.5px         | 태그 세로 패딩                    |
| `--spacing-popover-min`            | 280px          | 팝오버 최소 폭                    |
| `--spacing-pagination-control`     | 28px           | 페이지네이션 버튼                 |
| `--spacing-prompt-space`           | 25px           | 프롬프트 간격                     |
| `--spacing-prompt-close-top`       | 27px           | 프롬프트 닫기 top                 |
| `--spacing-prompt-close-right`     | 18px           | 프롬프트 닫기 right               |

화면 골격에는 `section-gap` 16px, 휴대폰 14px, 최대 폭 1180px, 2단 열 간격 16px를 쓴다. 스터디룸 계승 골격에는 페이지 여백 32px, 휴대폰 24px, 좌측 360px, 우측 최대 740px, 열 간격 20px를 쓴다. 이 값은 `PageLayout`, `SplitLayout`, `ColumnLayout`이 소유하고 화면이 다시 적지 않는다.

**터치 타깃 44px 규칙**: 보이는 크기는 작게 두더라도 `:after` 로 히트박스만 44px 로 넓힌다. 아이콘 버튼을 크게 그려서 맞추지 않는다.

---

## 5. 모서리와 그림자

| 토큰                                 | 값    | 쓰는 곳              | 유틸             |
| ------------------------------------ | ----- | -------------------- | ---------------- |
| `--radius-button` / `--radius-input` | 8px   | 버튼·입력            | `rounded-button` |
| `--radius-row`                       | 9px   | 목록 행              | `rounded-row`    |
| `--radius-card`                      | 12px  | 카드                 | `rounded-card`   |
| `--radius-checkbox`                  | 5px   | 체크박스             |                  |
| `--radius-focus`                     | 6px   | 포커스 링            |                  |
| `--radius-control-compact`           | 4px   | 작은 제어(코드칩 등) |                  |
| `--radius-section`                   | 16px  | 큰 구획 블록         |                  |
| `--radius-pill`                      | 999px | 칩·배지·게이지 트랙  | `rounded-pill`   |

체크박스처럼 1.5px 테두리가 필요한 v22 부품은 `--border-width-precision`과 `border-precision`을 쓴다. 일반 카드 테두리는 기존 1px `border`를 유지한다.

그림자는 **아래 둘만** 허용한다. 장식 그림자는 금지다. 카드에는 그림자를 넣지 않는다 (테두리 `1px solid gray-3` 으로 구분).

| 토큰               | 값                                | 쓰는 곳                     |
| ------------------ | --------------------------------- | --------------------------- |
| `--shadow-cta`     | `0 4px 0 var(--orange-10)`        | 큰 오렌지 CTA (눌리는 느낌) |
| `--shadow-popover` | `0 6px 18px rgb(26 26 26 / 0.13)` | 팝오버·드롭다운             |

전환은 `.16s ease-out` 으로 **배경·테두리·글자색만** 준다. `prefers-reduced-motion` 을 존중한다.

---

## 6. 공용 부품 규격

승인 프로토타입 v22 에서 실측한 규격이다 (`docs/mvp-g/design-spec-v22.md §3`). 이 규격 밖의 부품을 새로 그리지 않는다. 색·radius·글자 크기는 전부 §2~§5 토큰을 참조하고, 아래 표의 값은 그 토큰이 실제로 만들어내는 결과다.

### 6.1 버튼·칩·배지

| 부품      | 최소 높이 | 패딩          | 모서리 | 글자                                |
| --------- | --------- | ------------- | ------ | ----------------------------------- |
| 작은 버튼 | 44px      | `0 13px`      | 8px    | 12px / 700                          |
| 큰 CTA    | 50px      | `0 20px`      | 8px    | 14.5px / 800, 그림자 `--shadow-cta` |
| 배지      | 22px      | `0 10px`      | 999px  | 10.5px / 800                        |
| 앱바 칩   | 32px      | `6px 11px`    | 999px  | 12px / 600                          |
| 선택 칩   | 44px      | `0 14px`      | 999px  | 11.5px / 700                        |
| 알약 필터 | 38px      | `0 15px`      | 999px  |                                     |
| 세그먼트  | 40~44px   | 트랙 패딩 4px |        | 선택된 칸만 흰 배경                 |

**버튼 안 텍스트 정렬**: `inline-flex` + `align-items:center` + `justify-content:center` + `line-height:1`. 상하 패딩만으로 중심을 잡지 않는다.

### 6.2 목록 행

| 항목                      | 값                                                    |
| ------------------------- | ----------------------------------------------------- |
| 구조                      | `[지표(고정폭)] [본문(늘어남)] [액션(고정폭)]`        |
| 최소 높이 / 패딩 / 모서리 | 58px / `11px 12px` / 9px                              |
| 행 간격                   | 7px                                                   |
| 게이지 트랙 폭            | 96px (휴대폰 56px, 2단 열 안 72px)                    |
| 퍼센트 칸 폭              | 44px 우측 정렬 + tabular-nums (휴대폰 40px)           |
| 액션 칸 폭                | 128px, 2버튼 172px (휴대폰 96px)                      |
| 액션 버튼                 | `width:100%` → 같은 목록 안 버튼 왼쪽 좌표가 일치한다 |
| 체크박스                  | 20px 사각, radius 5px, 테두리 1.5px                   |

### 6.3 게이지

| 부품                                                       | 높이                |
| ---------------------------------------------------------- | ------------------- |
| 두 색 게이지(문제 푼 것 `orange-7` + 개념 정리 `orange-4`) | 8px                 |
| 큰 두 색 게이지                                            | 10px                |
| 레벨 막대                                                  | 9px (최소 폭 130px) |
| 얇은 게이지                                                | 7px                 |
| 이어 풀기 막대                                             | 6px                 |

트랙 모서리는 전부 `--radius-pill`.

#### 6.3.1 예상 등급 게이지 (등급 범위 막대)

응시장·리포트의 예상 등급 게이지는 **1~9 등급 9칸 눈금** 위에 `[low, high]` 구간을 오렌지 막대로 얹는다.

| 항목 | 값 |
| ---- | -- |
| 눈금 | `1 2 3 4 5 6 7 8 9` 9칸 균등 분할. `GRADE_MIN = 1`, **`GRADE_MAX = 9`** |
| 밴드 폭 | `100 / (GRADE_MAX - GRADE_MIN + 1)` = 100/9 (한 등급 ≈ 11.11%) |
| 트랙 | 높이 10px, 배경 `gray-2`, 모서리 `--radius-pill` |
| 구간 막대 | `orange-4 → orange-7` 그라디언트, 트랙 안쪽 여백 2%p |
| 눈금 라벨 | `text-xs`(12px)/600, `gray-7`, `tabular-nums`, 9칸 균등 `justify-between` |
| 라벨 방향 | 1이 왼쪽(최상), 9가 오른쪽(최하). 저학년 진입 시에도 방향 고정 |
| 표기 | 항상 `{low}~{high}등급` 범위. 근거 칩(실측/예측)과 함께 |

- 눈금·밴드 폭·clamp 상한을 5로 두는 것은 오류다(§D-EDU 고정값 등급 스케일 잠금). 6~9등급 학생 데이터가 막대 밖으로 잘린다.
- 심리 근거(design.md §10): 등급을 **범위**로만 노출하는 것은 의도된 마찰(뱅크샐러드 신뢰 설계) 겸 손실회피 완화다. 단일 등급 단정은 낮은 등급 학생에게 이탈 신호가 되므로 범위+근거로 신뢰를 설계한다.

### 6.4 카드와 빈 상태

- 카드: `bg-white` + `border 1px gray-3` + radius 12px + 안쪽 여백 16px. 그림자 없음.
- 빈 상태: 점선 테두리, 패딩 `38px 22px`, CTA 최소 높이 46px.
- 오류 상태: 테두리 `#f0c4c0`, 배경 `#fff0f0`, 재시도 버튼 최소 높이 44px.
- **빈 카드 금지**: 그날 내용이 없는 블록은 자리를 비우지 않고 아예 렌더하지 않는다. 빈 게이지와 회색 자리표시는 거짓 약속이다.

데이터 양 계약:

- 0건: `EmptyState`가 안내와 다음 행동을 함께 제공한다. 행동이 없으면 해당 구획 자체를 렌더하지 않는다.
- 소량: `ListRow`·`DataList` 기본 흐름을 쓴다.
- 대량: `DataList`의 명시적 `maxVisibleItems`와 펼치기·접기, 또는 `Pagination`을 사용한다. 무한 격자나 무제한 높이 확장은 금지다.

### 6.5 재사용 컴포넌트

`@/shared/components/ui` 의 공용 부품을 먼저 찾는다. 실재 파일 35종: `button` · `card` · `checkbox` · `input` · `text-field` · `textarea` · `select` · `radio-group` · `radio-card` · `toggle` · `search-input` · `tag-input` · `form` · `required-mark` · `data-list` · `list-item` · `pagination` · `accordion` · `dialog` · `popover` · `dropdown-menu` · `prompt` · `bottom-toast` · `stat-chip` · `status-badge` · `empty-state` · `preparing` · `confetti` · `icon` · `media-frame` · `profile-avatar` · `back-button` · `scroll-to-top-button` · `studyroom-status-toggle`. 사용 규칙은 `docs/ui-guidelines.md §5`.

feature 단위 컴포넌트(코드 실재 기준, `@/features/<도메인>` 아래):

| 문서상 이름    | 코드 실재                                                         |
| -------------- | ----------------------------------------------------------------- |
| 약점 트리      | ✅ `features/*/tree`(TreeMap은 개념명, 파일은 트리 컴포넌트군)    |
| AI 코치        | ✅ 존재하나 이름은 `CoachChat` 아님(ai-coach 계열). 갭 K-1        |
| 펜슬 풀이      | ✅ `shared/components/drawing`(DrawingCanvas 개념)                |
| 레벨 배지      | ✅ `features/point/components/level-badge.tsx`(`LevelBadge`)      |
| 연속·동기 헤더 | ✅ `open-challenge/.../motive-header.tsx`(StreakBanner는 개념명)  |
| 온보딩 스텝    | ✅ `app/(private)/onboarding`(전용 컴포넌트 아닌 페이지 내부)     |
| 포인트 원장    | ⚠️ `PointLedger`라는 컴포넌트 없음(포인트 도메인 내 산재). 갭 K-1 |
| 풀이 공유 목록 | ⚠️ `SolutionShareList` 없음. 갭 K-1                               |
| 대신 보기 띠   | ✅ `features/impersonation/components/impersonation-banner.tsx`  |

> 문서상 이름(`CoachChat`·`PointLedger`·`SolutionShareList`)은 코드에 그대로 존재하지 않는다. 개념명으로만 두고, 실제 조립 지점은 갭 문서 §K에 매핑한다.

### 6.6 레이아웃 컴포넌트

| 부품               | 소유하는 규격                                                              |
| ------------------ | -------------------------------------------------------------------------- |
| `PageLayout`       | 페이지 여백 16px, 최대 폭 1180px 또는 콘텐츠 최대 폭 1100px                |
| `SplitLayout`      | 일반 2단 `1.28fr : 1fr`, 할 일·회고 `1.34fr : 1fr`, 구 상세 `1.35fr : 1fr` |
| `ColumnLayout`     | 스터디룸 여백 24/32px, 좌측 360px, 우측 최대 740px, 열 간격 20px           |
| `CollectionLayout` | 0건 `EmptyState`, 과다 항목 명시적 접기·펼치기                             |
| `ExamTakeLayout`   | 응시 레일 248px, 접힘 56px, 문제 영역 `minmax(0,1fr)`, 간격 13px           |
| `ExamWizardLayout` | 선생님 시험 열기 `minmax(0,1fr) : 300px`, 간격 13px                        |

이 부품들은 `@/layout` 에 있다(`src/layout/`: `page-layout.tsx` · `split-layout.tsx` · `column-layout.tsx` · `collection-layout.tsx` · `exam-layout.tsx`, 배럴 `index.ts`). `@/shared/components/ui` 가 아니다. 3역할 hub(학생·선생님·관리자)는 이 부품 위에 셸(`app-shell` · `sidebar` · admin-shell)을 얹어 구성한다. 역할별 셸 분기는 globals.css의 `[data-admin-shell]` · `[data-study-room-shell]` · `[data-private-app-shell]` 속성 선택자가 소유한다(사이드바 표시·헤더 숨김·패딩).

레이아웃 부품의 자식은 항상 `min-width:0`을 상속한다. 따라서 긴 텍스트와 이미지가 열 너비를 밀어내지 않는다. 화면은 이 비율과 최대 폭을 임의 class로 다시 선언하지 않는다.

### 6.7 MVP-G 상태 집중 패턴 (v2.0.2 출고 후보)

정상 화면의 설명과 제어를 오류·빈 상태에 그대로 남기지 않는다. 상태마다 사용자가 지금 판단해야 하는 것만 남긴다.

| 상태 | 남기는 것 | 숨기는 것 | 주 행동 |
| --- | --- | --- | --- |
| 시험 저장 오류 | 실패한 작업, 담은 문항 보존 여부, 다시 내기, 임시 보관 | 정상 단계 바, 입력 방식 카드 | `다시 내기` |
| 회원 검색 빈 결과 | 현재 탭, 검색어, 다른 역할 탭의 결과 유무 | 결과와 무관한 최근 가입 보조 필터 | 다른 탭에서 같은 검색어 찾기 |
| 문제은행 자산 빈 상태 | 선택한 단원·학년, 빈 이유, 선생님 시험 열기에 미치는 영향 | 전체 문항 요약, 검수 수치, 일괄 올리기 보조 패널 | 이 단원 문항 올리기 |

오류와 빈 상태에서도 전역 내비게이션과 계정 문맥은 유지한다. 교사 헤더는 시험 오류 본문과 겹치지 않도록 일반 흐름(`relative z-10`)에 두며, 학생 헤더만 학습 화면의 문맥 보존을 위해 `sticky top-0 z-30`을 유지한다.

문제은행 학년 필터는 `HIGH_1`과 `HIGH_2`만 허용한다. 화면 라벨과 허용 과목은 다음 계약을 함께 쓴다.

| 값 | 화면 라벨 | 허용 과목 | 선택 변경 시 | 수치 표기 |
| --- | --- | --- | --- | --- |
| `HIGH_1` | 고1 | 공통수학1, 공통수학2 | 이전 단원 선택을 비우고 허용 과목 안에서 다시 선택 | 선택 학년, 단원, 난이도를 적용한 결과 수 |
| `HIGH_2` | 고2 | 대수, 미적분Ⅰ, 확률과 통계 | 이전 단원 선택을 비우고 허용 과목 안에서 다시 선택 | 선택 학년, 단원, 난이도를 적용한 결과 수 |

금지: `HIGH_3` 또는 고3 필터, 고1과 대수 조합, 고2와 공통수학1 조합, 전체 자산 수와 필터 결과 수를 같은 결과 제목으로 표시. 빈 상태는 `0개`와 선택한 학년, 단원, 난이도를 함께 읽을 수 있어야 한다.

세 패턴의 승인 정본은 `prototypes/mvp-g-3역할-hub-v24.2-gpt-codex-20260829-1054.html`이고, 1280×800·1024×768·390×844 실제 CSS viewport에서 같은 요소 순서와 열 전환을 검증한다. 관리자 문제은행은 모바일에서 `.bankcols`를 한 열로 계산하고, 문항 본문은 최소 200px 읽기 폭, 문항 행은 최소 300px, 행동은 최소 44px을 확보한다.

### 6.8 관리자 대신 보기

2026-08-05 eng-design 승인 로그의 후속 결정인 `대신보기 존치, 감사로그 기각`을 적용한다. 학생, 선생님, 관리자 3역할 범위는 바뀌지 않는다. 관리자가 대상 회원의 기존 역할 셸로 임시 전환하는 운영 상태다.

| 요소 | 계약 |
| --- | --- |
| 진입 | 회원 목록 행과 회원 상세 지원 카드에 `대신 보기`를 둔다 |
| 상단 띠 | `sticky top-0 z-50`, 최소 높이 48px, `bg-orange-600`, 흰 글자, 가로 가운데 정렬과 줄바꿈 |
| 필수 표시 | `회원명님의 화면을 보고 있습니다`, 최대 30분, 남은 시간 |
| 복귀 | 흰 배경의 `관리자로 돌아가기` 버튼. 성공 시 관리자 회원 목록으로 이동 |
| 만료 | 시작 후 30분. 만료 또는 인증 복구 실패 시 로그인으로 안전하게 이동 |
| 로딩 | 버튼을 비활성화하고 `대신 보는 중`으로 표시. 중복 실행 금지 |
| 오류 | 회원 상세를 유지하고 원인과 다시 시도 행동을 표시 |
| 제외 | 대신 보기 감사로그 전용 메뉴, 탭, 목록 화면 |

대신 보기 띠는 대상 역할의 앱 헤더보다 위에 둔다. 화면 콘텐츠와 내비게이션은 대상 역할의 기존 구조를 바꾸지 않는다. 휴대폰에서는 회원명, 시간, 복귀 버튼이 여러 줄로 접혀도 44px 행동 영역과 문구 순서를 유지한다.

---

## 7. 반응형

**태블릿 퍼스트**다. mobile-first 가 아니다. 1순위 기기가 태블릿 + 펜슬이기 때문이다.

| 순서              | 폭                                         | 기준                                                |
| ----------------- | ------------------------------------------ | --------------------------------------------------- |
| ① 태블릿 (베이스) | 1024 × 768 가로                            | 모든 화면의 기본 레이아웃을 여기서 확정한다         |
| ② 데스크톱        | 1280 × 800 (`--breakpoint-desktop` 1200)   | 태블릿 레이아웃을 넓히고 사이드바 + 컨테이너 센터링 |
| ③ 휴대폰          | 390 × 844 (`--breakpoint-tablet` 768 미만) | 단일 컬럼 스택. 하단 탭 5칸(최소 높이 52px)         |

접힘선은 **768px** 다. 화면 위 두 칸은 접힘선 안에 넣고, 다음 구획 머리글은 일부러 살짝 걸쳐 스크롤 단서를 남긴다.

---

## 8. 톤과 안티룰

**한 줄**: "제대로 풀면 내 지도가 오렌지로 채워진다." 모든 결정이 이걸 섬긴다.

톤은 B+A 블렌드다. B 골격(연속·포인트·레벨·큰 CTA·채워지는 트리)에 A 톤(여백, 타입 스케일 준수, 이모지 절제, 공부 앱의 진중함)을 얹는다. 숫자는 정직하게 보여준다(오답률·자력정답률·통과율).

하지 말 것:

- 시스템에 없는 색. 트리도 오렌지 강도 한 축만.
- 타이포 임의 px. 스케일 유틸만.
- 이모지 남발. 기능적으로 필요한 1~2개만.
- 근거 없는 격려 카피. 숫자와 함께 쓴다.
- 과한 그림자·네온·셀레브레이션.
- Unicode U+2014 문자를 UI 문구에 넣는 것.
- 또래 비교, 연속 일수 리셋 강조, 잠금·해금 게이트. 셋 다 벤치마크 조사로 명시 거부됐다 (`docs/mvp-g/design-spec-v22.md §5.1`).

---

## 9. 토큰을 새로 만들 때

1. 먼저 기존 토큰으로 되는지 본다. 대부분 된다.
2. 안 되면 이 문서와 `globals.css` 를 **같은 커밋에서** 함께 고친다.
3. 이름은 기존 관례를 따른다. 색은 `--color-*`, 간격은 `--spacing-*`, 모서리는 `--radius-*`, 그림자는 `--shadow-*` 네임스페이스에 넣어야 Tailwind 유틸리티로 나온다.
4. 새 세대 이름(`4.0` 같은 것)을 만들지 않는다. 세대가 갈리면 정본도 갈린다.
5. 컴포넌트 안에 raw hex 나 임의 px 을 넣지 않는다. 그게 필요하면 토큰이 빠진 것이므로 여기에 추가한다.

---




## 10. 레이아웃

### 4.1 간격

`@theme` 의 `--spacing-*` 로 노출돼 있어 Tailwind 유틸리티로 바로 쓴다 (`p-card-pad`, `gap-block-gap`, `min-h-touch-min` 등).

| 토큰                           | 값    | 뜻                          | 유틸 예             |
| ------------------------------ | ----- | --------------------------- | ------------------- |
| `--spacing-card-pad`           | 16px  | 카드 안쪽 여백              | `p-card-pad`        |
| `--spacing-card-pad-mobile`    | 14px  | 휴대폰 390 카드 안쪽 여백   | `p-card-pad-mobile` |
| `--spacing-block-gap`          | 12px  | 카드 사이 간격              | `gap-block-gap`     |
| `--spacing-section-gap`        | 16px  | 구획(본문 영역) 여백        | `p-section-gap`     |
| `--spacing-section-gap-mobile` | 14px  | 휴대폰 구획 여백            |                     |
| `--spacing-row-gap`            | 7px   | 목록 행 사이 간격           | `gap-row-gap`       |
| `--spacing-inline-gap-xs`      | 5px   | 페이지네이션·문항 격자      | `gap-inline-gap-xs` |
| `--spacing-inline-gap`         | 6px   | 행 안의 액션 두 개          | `gap-inline-gap`    |
| `--spacing-content-gap`        | 8px   | 타일·콘텐츠 묶음            | `gap-content-gap`   |
| `--spacing-grid-gap`           | 11px  | 문제·수업 카드 격자         | `gap-grid-gap`      |
| `--spacing-column-gap`         | 16px  | 2단 배치 열 간격            | `gap-column-gap`    |
| `--spacing-room-gap`           | 20px  | 스터디룸 좌우 영역          | `gap-room-gap`      |
| `--spacing-exam-layout-gap`    | 13px  | 시험 응시·열기 2단 간격     |                     |
| `--spacing-exam-rail`          | 248px | 시험 응시 펼친 레일         |                     |
| `--spacing-exam-rail-folded`   | 56px  | 시험 응시 접힌 레일         |                     |
| `--spacing-exam-wizard-aside`  | 300px | 선생님 시험 열기 보조열     |                     |
| `--spacing-empty-pad-x`        | 22px  | 빈 상태 가로 여백           | `px-empty-pad-x`    |
| `--spacing-empty-pad-y`        | 38px  | 빈 상태 세로 여백           | `py-empty-pad-y`    |
| `--spacing-touch-min`          | 44px  | 터치 타깃 최소              | `min-h-touch-min`   |
| `--spacing-control-sm`         | 44px  | 작은 버튼·선택 칩 최소 높이 |                     |
| `--spacing-control-lg`         | 50px  | 큰 CTA 최소 높이            |                     |
| `--spacing-chip-min`           | 32px  | 앱바 칩 최소 높이           |                     |
| `--spacing-badge-min`          | 22px  | 배지 최소 높이              |                     |
| `--spacing-row-min`            | 58px  | 목록 행 최소 높이           |                     |

셸 치수는 기존 토큰을 그대로 쓴다: `--spacing-header-height` 60px, `--spacing-sidebar-width` 260px, `--spacing-grid-margin` 20px.

화면 골격에는 `section-gap` 16px, 휴대폰 14px, 최대 폭 1180px, 2단 열 간격 16px를 쓴다. 스터디룸 계승 골격에는 페이지 여백 32px, 휴대폰 24px, 좌측 360px, 우측 최대 740px, 열 간격 20px를 쓴다. 이 값은 `PageLayout`, `SplitLayout`, `ColumnLayout`이 소유하고 화면이 다시 적지 않는다.

**터치 타깃 44px 규칙**: 보이는 크기는 작게 두더라도 `:after` 로 히트박스만 44px 로 넓힌다. 아이콘 버튼을 크게 그려서 맞추지 않는다.

### 4.2 컨테이너 최대 너비

1440px과 1200px은 하나로 합치지 않는다. 실제 라우트 역할이 다르기 때문이다. 1440px은 커뮤니티, 게시판, 상담, 관리자처럼 목록과 보조열을 함께 쓰는 넓은 캔버스다. 1200px은 학습, 약점 트리, 친구, 포인트, 학부모, 코스처럼 읽기 흐름이 중심인 제품 셸이다.

아래 값은 현재 코드에 있는 값으로 만든 컨테이너 토큰이다. 2026-08-11에 임의 최대 폭 41건 중 38건을 실제 화면 class에서 이 토큰으로 치환했다.

| 단계 | 새 토큰과 값 | Tailwind 목적지 | 쓰는 화면 |
| ---- | ------------ | --------------- | --------- |
| 넓은 셸 | `--container-shell-wide: 1440px` | `max-w-shell-wide` | 커뮤니티, 게시판, 상담, 문의, 관리자 목록과 상세 |
| 표준 셸 | `--container-shell: 1200px` | `max-w-shell` | 학습, 약점 트리, 친구, 포인트, 학부모, 코스, 응시장, 오답 회독, 질문(본문), 환경설정 (학생 대시보드 전 화면 통일, 2026-08-27) |
| 페이지 | `--container-page: 1180px` | `max-w-page` | 공용 `PageLayout` 기본 폭 |
| 본문 | `--container-content: 1100px` | `max-w-content` | `PageLayout width="content"` |
| 읽기 열 | `--container-reading: 740px` | `max-w-reading` | 스터디룸, 과제, Q&A, 학습노트의 오른쪽 읽기 열 |
| 넓은 대화상자 | `--container-dialog-wide: 576px` | `max-w-dialog-wide` | 설명과 폼이 함께 있는 대화상자 |
| 표준 대화상자 | `--container-dialog: 400px` | `max-w-dialog` | 확인, 설정, 짧은 폼 대화상자 |
| 작은 대화상자 | `--container-dialog-compact: 384px` | `max-w-dialog-compact` | 경고와 짧은 확인 대화상자 |
| 짧은 설명 | `--container-copy: 320px` | `max-w-copy` | 빈 상태와 카드의 짧은 설명 |
| 한 줄 라벨 | `--container-label: 260px` | `max-w-label` | 말줄임이 필요한 제목과 태그 라벨 |

`--container-*` 변수는 Tailwind v4에서 접두사 `container`를 반복하지 않고 `max-w-shell-wide` 같은 class를 생성한다. 숫자형 `max-w-360`, `max-w-185`, `max-w-80`, `max-w-65`는 기본 spacing 4px 배수라 각각 1440px, 740px, 320px, 260px이다.

| 치환 전 class | 치환 전 | 지금 | 목적과 처리 | 치환 class | 최대 폭 변화 |
| ------------- | ------: | ---: | ----------- | ---------- | -----------: |
| `max-w-[1440px]` | 14 | 0 | 넓은 라우트 셸, 정확 일치 | `max-w-shell-wide` | 0px |
| `max-w-[1200px]` | 9 | 0 | 제품 본문 셸, 정확 일치 | `max-w-shell` | 0px |
| `max-w-[740px]` | 5 | 0 | 읽기 열, 정확 일치 | `max-w-reading` | 0px |
| `max-w-[570px]` | 4 | 0 | 인증 화면과 배너를 넓은 대화상자 단계로 흡수 | `max-w-dialog-wide` | +6px |
| `max-w-[1120px]` | 3 | 0 | 관리자 편집 화면을 본문 단계로 흡수 | `max-w-content` | -20px |
| `max-w-[840px]` | 1 | 0 | 상담 상세의 읽기 흐름을 읽기 열로 흡수 | `max-w-reading` | -100px |
| `max-w-[420px]` | 1 | 0 | 초대 폼을 표준 대화상자로 흡수 | `max-w-dialog` | -20px |
| `max-w-[1000px]` | 1 | 0 | 학부모 자녀 상세를 본문 단계로 흡수 | `max-w-content` | +100px |
| `max-w-[180px]` | 2 | 2 | 드로잉 진행 막대와 읽은 사람 팝오버의 부품 내부 치수. 260px 라벨 단계로 키우면 기능 모양이 달라져 유지 | 없음 | 0px |
| `max-w-[173px]` | 1 | 1 | 사이드바 한 줄 말줄임 폭. 260px 라벨 단계는 사이드바 폭 계약을 넘으므로 유지 | 없음 | 0px |

기존 비임의 유틸리티인 `max-w-360`, `max-w-185`, `max-w-80`, `max-w-65`, `max-w-full`, `max-w-none`, `max-w-xl`, `max-w-sm`, `max-w-dialog-*`는 이번 41건 범위가 아니어서 유지했다.

### 4.3 그리드

일반 콘텐츠 그리드는 휴대폰 1열, 태블릿 2열, 데스크톱 3열을 기본으로 한다. 실제 사용량도 `grid-cols-2` 42회, `grid-cols-3` 29회, `grid-cols-1` 26회에 집중돼 있다.

| 기준 폭 | 기본 열 수 | 규칙 |
| ------- | ---------- | ---- |
| 휴대폰 390 | 1열 | 카드와 폼을 세로로 쌓는다 |
| 태블릿 1024 | 2열 | `SplitLayout`과 비교형 콘텐츠의 기본이다 |
| 데스크톱 1280 | 3열 | 같은 종류의 카드 모음과 요약 지표에 쓴다 |

| 예외 | 실측 | 허용 범위 |
| ---- | ---- | --------- |
| 4열 | `grid-cols-4` 12회 | 작은 지표, 상태, 배지처럼 한 항목이 짧은 경우 |
| 5열 | `grid-cols-5` 4회 | 답안 선택과 문항 이동처럼 번호가 핵심인 조작 격자 |
| 10열 | `grid-cols-10` 2회 | `exam-analysis-card.tsx`, `exam-attempt-client.tsx`의 문항별 정오 번호판만. 일반 페이지 레이아웃에는 금지 |

### 4.4 반응형

**태블릿 퍼스트**다. 1순위 기기가 태블릿과 펜슬이기 때문이다.

| 순서 | 폭 | 기준 |
| ---- | -- | ---- |
| ① 태블릿 베이스 | 1024 × 768 가로 | 모든 화면의 기본 레이아웃을 여기서 확정한다 |
| ② 데스크톱 | 1280 × 800 (`--breakpoint-desktop` 1200) | 태블릿 레이아웃을 넓히고 사이드바와 컨테이너를 센터링한다 |
| ③ 휴대폰 | 390 × 844 (`--breakpoint-tablet` 768 미만) | 단일 컬럼 스택, 하단 탭 5칸, 최소 높이 52px |

접힘선은 **768px**다. 화면 위 두 칸은 접힘선 안에 넣고, 다음 구획 머리글은 일부러 살짝 걸쳐 스크롤 단서를 남긴다.

---


## 11. 높이와 겹침 순서

### 6.1 그림자

그림자는 **아래 둘만** 허용한다. 장식 그림자는 금지다. 카드에는 그림자를 넣지 않고 테두리 `1px solid gray-3`으로 구분한다.

| 토큰 | 값 | 쓰는 곳 |
| ---- | -- | ------- |
| `--shadow-cta` | `0 4px 0 var(--orange-10)` | 큰 오렌지 CTA의 눌리는 느낌 |
| `--shadow-popover` | `0 6px 18px rgb(26 26 26 / 0.13)` | 팝오버와 드롭다운 |

전환은 `.16s ease-out`으로 배경, 테두리, 글자색만 준다. `prefers-reduced-motion`을 존중한다.

### 6.2 겹침 순서

2026-08-11에 임의 겹침 값 8건을 의미 토큰으로 전부 치환했다. 일반 숫자 유틸리티 `z-0`부터 `z-50`까지는 이번 범위가 아니어서 유지했다.

| 층 | 토큰과 값 | Tailwind 사용 | 맡는 컴포넌트 |
| -- | --------- | ------------- | --------------- |
| 기본 | `--z-layer-base: 0` | `z-(--z-layer-base)` | 일반 콘텐츠와 배경 |
| 내부 강조 | `--z-layer-raised: 10` | `z-(--z-layer-raised)` | 카드 내부 배지, 편집기 선택 도구, 이미지 조절점 |
| 떠 있는 셸 | `--z-layer-chrome: 40` | `z-(--z-layer-chrome)` | 고정 헤더, 학생·교사 헤더, 사이드바, 가장 위로 버튼, 대리 로그인 배너 |
| 펼침 | `--z-layer-disclosure: 50` | `z-(--z-layer-disclosure)` | 드롭다운, 팝오버, 셀렉트, 태그 메뉴, 툴팁, 편집기 메뉴 |
| 대화상자 | `--z-layer-dialog: 60` | `z-(--z-layer-dialog)` | Dialog, Prompt, 체크포인트, 전체 지우기와 페이지 제한 확인 |
| 알림 | `--z-layer-notification: 100` | `z-(--z-layer-notification)` | `ToastProvider`, `showBottomToast` |
| 최상위 | `--z-layer-loading: 9999` | `z-(--z-layer-loading)` | 전체 화면 로딩 가림막만 |

z-index는 같은 stacking context 안에서만 비교된다. 부모의 `transform`, `opacity`, `isolation`, `fixed`, `sticky`가 새 context를 만들 수 있으므로 큰 숫자로 부모 경계를 뚫으려 하지 않는다.

| 현재 값 | 실측 | 현재 대표 사용처 | 흡수 목적지 |
| ------- | ---: | --------------- | ----------- |
| `z-0` | 1 | 준비 화면 내부 기본층 | 기본 |
| `z-1` | 1 | 기본 헤더 내부 장식 | 내부 강조 |
| `z-10` | 24 | 카드 배지, 편집기 도구, sticky 보조영역 | 내부 강조. 실제 셸에 붙은 것은 떠 있는 셸 |
| `z-20` | 7 | 학생 헤더, 드로잉 패널, 카드 오버레이 | 학생 헤더는 떠 있는 셸, 나머지는 내부 강조 |
| `z-30` | 2 | 학생 헤더, 코스 sticky 바 | 학생 문맥과 학습 제어를 스크롤 중 유지 |
| `z-10` 역할 예외 | 교사 헤더 1 | 시험 오류·스터디룸 본문과 겹치지 않는 일반 흐름 | `relative z-10`, sticky 금지 |
| `z-40` | 1 | 사이드바 | 떠 있는 셸 |
| `z-50` | 26 | 공용 Dialog, DropdownMenu, Popover, Select, 태그 메뉴, 앱 헤더 | 메뉴류는 펼침, Dialog·Prompt는 대화상자, 헤더·배너는 떠 있는 셸 |
| `z-[60]` | 0, `z-(--z-layer-dialog)` 4 | 체크포인트 Dialog, 삭제 확인, 드로잉 확인 2종 | 대화상자 |
| `z-[100]` | 0, `z-(--z-layer-disclosure)` 1 | 스터디룸 정보 툴팁 | 툴팁은 일시적 펼침 정보라 알림이 아니라 펼침 |
| `z-[9999]` | 0, `z-(--z-layer-disclosure)` 1과 `z-(--z-layer-loading)` 2 | 편집기 버블 메뉴 1곳, 전체 화면 로더 2곳 | 버블 메뉴는 펼침, 로더는 최상위. 로딩 가림막이 편집기 메뉴를 덮음 |
| React-Toastify 기본 `9999` | 라이브러리 1종 | 상단과 하단 토스트 컨테이너 | 알림. 별도 치환 과제에서 `--toastify-z-index`를 알림 토큰에 연결 |

---


## 12. 해야 할 것과 하지 말 것

해야 할 것:

- 오렌지는 행동, 정복도, 보상처럼 의미가 있는 곳에만 쓴다.
- 오답률, 자력정답률, 통과율처럼 근거가 있는 숫자로 동기를 만든다.
- 공용 레이아웃과 컴포넌트, 토큰을 먼저 찾고 화면은 의미만 조합한다.

하지 말 것:

- 시스템에 없는 색. 트리도 오렌지 강도 한 축만.
- 상대·친구를 파랑이나 새 색으로 칠하는 것. 회색 축과 이름표로 가른다 (§2.3.1).
- 타이포 임의 px. 스케일 유틸만.
- 이모지 남발. 기능적으로 필요한 1~2개만.
- 근거 없는 격려 카피. 숫자와 함께 쓴다.
- 과한 그림자·네온·셀레브레이션.
- em dash(Unicode U+2014) 문자를 UI 문구에 넣는 것.
- 또래 비교, 연속 일수 리셋 강조, 잠금·해금 게이트. 셋 다 벤치마크 조사로 명시 거부됐다 (`docs/mvp-g/design-spec-v22.md §5.1`).

---

## 부록 A. 2.0 리디자인 결정 배경 (구 design-system-2.0.md 병합, 이력 보존)

> 디에듀 2.0 학생 중심 리디자인의 디자인 소스 오브 트루스. 기존 `src/styles/globals.css` + `ui-guidelines.md` 위에 얹는다 (0부터 X). 비주얼 레퍼런스: `~/.gstack/projects/d-edu/designs/directions-20260611/board.html`. 방향 락: design-shotgun → **B+A 블렌드**.

## 0. 한 줄 (memorable thing)

**"제대로 풀면 내 지도가 오렌지로 채워진다."** 노력이 눈에 보이는 것. Thesis("많이가 아니라 제대로 풀어야 오른다")의 시각화다. 모든 결정은 이걸 섬긴다.

## 1. 톤 = B+A 블렌드

- **B 골격(동기부여)**: 연속(streak)·포인트·레벨, "바로 시작" 히어로 CTA, 채울수록 진해지는 약점 트리, 코치 칩.
- **A 톤(절제)**: 여백, 타입 스케일 준수, 이모지 절제, "공부 앱"의 진중함. 게임기처럼 보이지 않게.
- **C에서(정직)**: 오답률·자력정답률 등 숫자를 보여 신뢰. "막연한 격려" 금지.
- 타깃: 고등 3~5등급, 태블릿+펜슬. **동기부여 강하게(듀오링고처럼).** 홈에 큰 스트릭·레벨·셀레브레이션. 단 오렌지·Pretendard 시스템 안에서, 유치하지 않게(여전히 공부 앱). [사용자 확정: 동기 강하게]

## 2. 색 (시스템 토큰만, 새 팔레트 금지)

브랜드색은 **오렌지 하나**. 파랑·네이비·임의색 금지.
| 역할 | 토큰 | 값 |
|---|---|---|
| Primary | `--orange-7` | #ff4805 |
| Primary 진함 | `--orange-10` / `--orange-12` | #b93100 / #561700 |
| Primary 옅음(배경) | `--orange-1` | #fff4f1 |
| 텍스트 메인 | `--gray-scale-gray-95` | #1a1a1a |
| 라인 | `--gray-scale-gray-10` | #e0e0e0 |
| 배경 | (시스템) | #fcfbfa |
| 성공 | `--color-success` | #34c759 |
| 경고/막힘 마커 | `--color-warning` | #ff4040 |

### 약점 트리 = 오렌지 강도 한 축 (시그니처)

정복도를 **오렌지 농도**로 표현. 파랑/빨강 안 씀.
**4단계로 단순화 [사용자 확정]** (한눈에 구분):

```
미진단(회색 #f0efec) → 약점(옅은 오렌지 #ffd0c0) → 진행(중간 #ff7a4d) → 정복(진한 #ff4805)
```

- **% 항상 표시**(노드마다 정복도 숫자). 자력 정답 기반.
- 모의고사 자기신고분은 색 단계는 같되 작은 **"모의" 태그**로 구분한다. 빗금은 노이즈가 커서 폐기했다.
- 반복 막힘 = **⚠ 마커**(warning #ff4040), 노드 색은 안 바꿈.
- "채운다 = 오렌지가 뜨거워진다" = memorable thing과 직결.

## 3. 타이포 (globals.css @utility 그대로)

Pretendard. line-height 135% 기준.
| 유틸 | 크기/굵기 | 용도 |
|---|---|---|
| `font-display-1/2` | 56·40 / 700 | 랜딩 히어로 |
| `font-title-heading` | 32 / 700 | 화면 타이틀 |
| `font-headline1-heading` | 24 / 700 | 섹션 헤딩 |
| `font-body1-heading` | 18 / 600 | 카드 제목 |
| `font-body2-heading` | 16 / 600 | 본문 강조 |
| `font-label-heading` | 14 / 600 | 라벨·버튼 |
| `font-caption-heading` | 12 / 500 | 캡션·메타 |

> 임의 px 금지. 위 스케일로만.

## 4. 형태

- radius: 버튼/인풋 **8px**, 카드 **12px**, (B 모티프 카드 14~16px), 칩/뱃지 **999px**.
- 카드: `bg-white` + `border 1px #e0e0e0` + radius 12. 그림자 절제(A 톤).
- B 액센트 버튼: 큰 오렌지 CTA에 `box-shadow 0 5px 0 var(--orange-10)`(눌리는 느낌). 주요 CTA에 한정한다.

## 5. 컴포넌트

### 재사용 (shared/components/ui 28개)

Button(primary=orange-7) · Input · TextField · Textarea · Select · Checkbox · RadioGroup/RadioCard(답 선택·온보딩) · Dialog(코치 설정·해설 경고) · Accordion · DropdownMenu · Pagination · StatusBadge(상태 pill) · ListItem · Icon(lucide) · ProfileAvatar · Skeleton/MiniSpinner · BackButton.

### 신규 (feature 단위, 오픈챌린지 패턴 복제)

| 컴포넌트              | 역할         | 핵심                                                                                                                                                           |
| --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TreeMap**           | 약점 트리    | 단원 노드 그리드, 오렌지 강도 fill, ⚠ 마커, 탭→단원 문제. 범례(정복/약점/미진단/막힘)                                                                         |
| **CoachChat**         | AI 코치 패널 | 메시지 스트림 + 고정 칩 4개(시작을 못하겠어요/개념 다시/이거 맞아요?/다음 뭐 해요?) + 텍스트 입력. 헤더 카피 "답은 알려주지 않아요. 한 걸음씩 같이." 음성 없음 |
| **DrawingCanvas**     | 펜슬 풀이    | 펜/지우개/색/페이지, 이미지 스냅샷 저장. 풀이공유 첨부                                                                                                         |
| **StreakBanner**      | 연속         | 🔥 절제 사용, streak일수·복귀 앵커                                                                                                                             |
| **PointLedger**       | 포인트 지갑  | 잔액 + 적립/차감 타임라인(+10/+5/+100/−30). 레벨(성장지표)과 시각 분리                                                                                         |
| **LevelBadge**        | 레벨         | Lv.N + 경험치 게이지. 포인트와 다른 축임을 형태로 구분                                                                                                         |
| **OnboardingStepper** | 온보딩       | 학년·과목·등급·약점단원 → 1문제 → 트리 공개. 모의고사 진단=선택 스텝                                                                                           |
| **SolutionShareList** | 풀이공유     | 다른 학생 손글씨(드로잉)+텍스트, 추천순, 컨닝가드(내 COMPLETED 후 열람)                                                                                        |

## 6. 핵심 패턴

- **상단 동기 헤더**(로그인 후): streak · 포인트 · 레벨 한 줄. 과하지 않게(A 절제).
- **"바로 시작" CTA**: 홈/리스트 최상단에 추천 1문제 큰 오렌지 버튼("오늘의 문제 시작").
- **트리 반영 위젯**(결과 화면): 방금 푼 문제가 트리 노드를 진하게 만드는 미니 애니메이션 + 포인트 토스트.
- **코치 칩 바**: 문제 상세 우측(태블릿) / 하단 시트(폰). 정답 미제공 톤.
- **숫자 정직**: 오답률·자력정답률·통과율을 카드 메타로 노출(C 차용).

## 7. 8화면 적용 메모

1. **랜딩**(`/`): display 히어로 + Thesis 카피 + "문제 풀어보기" CTA. 1.0 섹션(수업/학생관리) 제거. 트리 미리보기로 시그니처 노출.
2. **온보딩**(`/onboarding`): OnboardingStepper. 입력 → 1문제 → 트리 공개. 모의고사 진단 선택.
3. **오픈챌린지 리스트**(`/open-challenge`): 추천 1문제 강조 + 필터/정렬 리스트. 카드에 오답률·통과율.
4. **문제 상세**(`/open-challenge/[id]`): 좌 문제+DrawingCanvas, 우 CoachChat. "정답 해설" 버튼(차감·트리제외 경고 Dialog).
5. **AI 코치 챗봇**: CoachChat(상세 내 패널, 별도 라우트 아님).
6. **결과**(`/open-challenge/[id]/result`): 정오답+통과율+트리 반영 위젯+포인트 토스트+풀이공유 진입.
7. **약점 트리**(`/tree`): TreeMap 과목별 대단원. "약점" 단정 대신 "더 풀어볼까?" 톤.
8. **풀이공유**(`/open-challenge/[id]/solutions`): SolutionShareList, 컨닝가드.
9. **포인트 지갑**(`/points`): PointLedger + LevelBadge(축 분리).

## 7.5 반응형 우선순위: 태블릿 퍼스트 (중요)

설계 기준 순서: **① 태블릿(베이스) → ② 웹/데스크톱 → ③ 모바일(마지막).** 1순위 기기가 태블릿+펜슬이라 mobile-first가 아니라 **tablet-first**로 짠다.

- **① 태블릿(베이스, 768~1024)**: 모든 화면의 기본 레이아웃을 여기서 확정. **가로 태블릿+펜슬이 히어로 케이스.** 문제 상세=2단(좌 문제+드로잉 캔버스 / 우 코치)이 기본형. 리스트·트리·결과·온보딩도 태블릿 폭(여백·2열 그리드)에 맞춰 디자인. 펜슬 타깃 ≥44px.
- **② 웹/데스크톱(≥1200)**: 태블릿 레이아웃을 넓히고 좌측 사이드바 네비 + 컨테이너 max-width 센터링. 트리/리스트는 더 넓은 그리드.
- **③ 모바일(<768, 마지막)**: 단일 컬럼 스택. 드로잉 캔버스 풀폭, 코치는 하단 시트(bottom sheet), 동기 헤더 압축. 깨지지 않게 graceful 다운.
- CSS: base = 태블릿 스타일, `@media (min-width:1200px)` 데스크톱, `@media (max-width:767px)` 모바일. (기존 globals.css 브레이크포인트 768/1200 재사용)
- 목업 보완: 1차 목업은 폰 프레임 위주였음 → **빌드 시 태블릿 베이스로 재구성**(특히 트리·리스트·결과·온보딩의 2열/와이드).

## 7.6 빌드 전 확정한 개선점 (1차 목업 검수 결과)

1. **일관성 셸**: 공통 상단 동기 헤더(streak·포인트·레벨) + 하단 탭/사이드바 + 카드 패딩·버튼 규격 단일화. 9화면이 한 앱처럼.
2. **수식 렌더**: KaTeX(또는 MathJax)로 수식을 렌더한다. 평문은 금지한다(수학 앱 필수).
3. **상태 전부**: 빈(신규=전부 회색 트리)·로딩(코치/리스트 스켈레톤)·에러·0건(공유/포인트) 상태 정의. 해피패스만 금지.
4. **태블릿 퍼스트**: §7.5대로.
5. **트리 가독성**: 오렌지 5단계 대비 강화(작은 노드도 구분), 자력/모의 구분은 빗금 대신 작은 "모의" 태그.
6. **동기 vs 진중함**: streak·포인트가 실제 문제 위에서 과하게 떠들지 않게(A 절제). "정답 해설" 버튼은 코치보다 덜 눈에 띄게(코치 사용 유도).

### 7.6.1 design-review 추가 (목업 게이트 결과: AI slop A-, design B+)

7. **트리 4단계 [확정]**: 미진단/약점/진행/정복 4단계 + % 항상 노출. 자력/모의는 "모의" 태그(빗금 폐기). 작은 노드에서도 한눈에 구분.
8. **터치 타깃 ≥44px**: 필터 칩·트리 노드·코치 칩 전부 펜슬/터치 기준 충족.
9. **모션 목적성**: 결과 화면 **트리-채움 셀레브레이션**(memorable moment) 1개 + 코치 메시지 등장. `prefers-reduced-motion` 존중, `transform/opacity`만 애니.
10. **타이포 폴리시**: 숫자(오답률·통과율·포인트) `tabular-nums`, 헤딩 `text-wrap:balance`, 둥근따옴표·`…`.

## 8. 안티-룰 (하지 말 것)

- 시스템에 없는 색(파랑·네이비·임의 그라데이션) 금지. 트리도 오렌지 강도만.
- 타입 임의 px 금지. 스케일 유틸만 쓴다.
- 이모지 남발 금지(A 톤). 🔥 streak 등 기능적 1~2개만.
- "막연한 격려" 카피 금지. 숫자와 근거를 함께 쓴다.
- 게임기처럼 과한 그림자·네온·셀레브레이션 금지(진중함 유지).

## 13. 학생 마이페이지·친구·포인트

> 기준 시안: `prototypes/mvp-g-학생-마이친구포인트-v1-gpt-codex.html`
>
> 적용 라우트: `/mypage`, `/friends`, `/points`

### 13.1 브랜드와 공통 셸

- 브랜드 형용사는 기존 정본의 **진중한 · 동기부여형 · 정직한**을 그대로 쓴다.
- 데스크톱은 v23 학생 셸의 `260px` 좌측 사이드바, `60px` 상단 헤더, 오답·연속·레벨·포인트 칩을 유지한다.
- 모바일은 사이드바를 숨기고 학습, 친구, 오답, 포인트, 마이 5개 목적지를 하단 탭으로 투영한다. 화면 안 CTA만으로 다른 핵심 화면을 우회하게 만들지 않는다.
- 화면 본문은 데스크톱 `max-width: 980px`, 모바일 단일 열이다. 데스크톱은 `minmax(0, 1fr)` 2열, 모바일은 `column` 1열로 바꾼다.
- 간격은 `--space-1/2/3/4/6/8/10`만 쓴다. 카드, 버튼, 행, pill은 기존 `--radius-card`, `--radius-row`, `--radius-pill`만 쓴다.

### 13.2 컴포넌트 인벤토리

| 컴포넌트 | 책임 | 상태와 제약 |
| --- | --- | --- |
| `ProfileSummaryCard` | 이름, 이메일, 공개 상태, 학습 목표, 프로필 수정 | 이메일 한 줄 말줄임. 목표는 여러 줄 확장. 목표 없음 상태 포함 |
| `AccountSettingsList` | 프로필 공개, 학생 알림 범주, 문의 내역, 결제·구독 | 토글 터치 영역 44px 이상. 데이터 계약 없는 결제·구독은 비활성과 이유를 함께 노출 |
| `StudentActivitySummary` | 스터디룸, 질문, 과제 제출, 완료율 | 값 0도 숨기지 않는다. 비율과 분모를 함께 표시 |
| `RecentTeachingNotes` | 최근 수업노트 2건과 전체 보기 | 제목 한 줄 말줄임. 0건은 스터디룸 이동 CTA |
| `FriendTurnPrompt` | 내 차례인 도전 수와 첫 행동 | 한 화면에 주 CTA 1개. 공개 순위나 압박 문구 금지 |
| `FriendListRow` | 이름, 최근 활동, 1대1 기록, 다음 행동 | 과다 데이터는 6행 뒤 더 보기. 긴 이름과 활동은 말줄임 |
| `ChallengeStack` | 내 차례, 상대 차례, 완료 상태 | 도전 제목, 과목·단원, 상대, 갱신 시각을 유지 |
| `DuelResultSummary` | 결과, 양쪽 시도 횟수, 풀이 차이 진입 | 승패만 강조하지 않고 시도와 풀이 차이를 함께 표시 |
| `PointBalanceCard` | 사용 가능 포인트와 학습 레벨 | 포인트와 레벨을 시각적으로 분리. 포인트를 실력 등급처럼 표현 금지 |
| `PointSpendPlace` | 사용처, 비용, 가능 여부, 이동 | 차감 전 비용 노출. 포인트 부족과 서버 미연결을 구분 |
| `PointTransactionRow` | 사유, 출처·날짜, 증감 | 적립과 사용을 부호와 색으로 중복 구분. 최근 6행 뒤 더 보기 |
| `ActionableEmptyState` | 0건 이유와 다음 행동 | 빈 카드마다 가장 작은 다음 행동 하나만 제공 |

### 13.3 화면별 정보 순서

#### 마이페이지

1. 프로필과 학습 목표
2. 누적 활동 숫자
3. 최근 수업노트와 참여 스터디룸
4. 프로필 공개와 알림 설정
5. 문의 내역과 계약 미확정 기능

기존 데이터 계약인 `name`, `email`, `profileImageUrl`, `isProfilePublic`, `learningGoal`, 학생 활동 리포트, 수업노트, 스터디룸만 사용한다. 결제·구독은 라우트와 DTO가 생기기 전까지 활성 행으로 만들지 않는다.

#### 친구

1. 내 차례 도전장
2. 친구 찾기와 친구 목록
3. 진행 중 도전장
4. 최근 1대1 결과와 풀이 차이

친구 화면은 리더보드가 아니다. `myTurn`, `lastActivity`, 친구별 기록, 도전 상태, 결과의 시도 횟수와 풀이 차이를 사용한다. 공개 순위, 전체 학생 비교, 연속 패배 자극 문구는 금지한다.

#### 포인트

1. 사용 가능 잔액
2. 포인트와 분리된 학습 레벨
3. 사용처와 차감 비용
4. 포인트를 모으는 실제 학습 행동
5. 최근 적립·사용 원장

거래 유형은 현재 계약의 `EARN_CORRECT`, `EARN_STREAK`, `EARN_SIGNUP`, `SPEND_SOLUTION`만 원장에 표시한다. 친구 도전장 10P는 거래 유형이 추가되기 전까지 서버 미연결 상태로 표시한다.

### 13.4 상태 계약

| 상태 | 공통 동작 |
| --- | --- |
| 정상 | 실제 API 필드만 표시. 화면별 주 행동은 1개 |
| 빈 | 기본 프로필과 셸은 유지. 빈 카드 안에 원인과 작은 다음 행동 1개 |
| 로딩 | 최종 카드 높이를 유지하는 골격. 버튼과 토글 비활성 |
| 오류 | 실패한 카드 안에 이유와 다시 시도. 다른 카드와 전역 내비게이션 유지 |
| 과다 | 목록 6행 뒤 더 보기. 한 줄 메타는 말줄임, 목표와 설명은 자연 확장 |
| 비활성 | 포인트 부족, 진행 중 도전, 서버 미연결의 이유를 컨트롤 주변에 평문으로 표시 |

### 13.5 금지 패턴

- 설정 토글을 화면 첫 시야의 주 콘텐츠로 만들지 않는다.
- 친구 관계를 전체 공개 리더보드나 인기 순위로 바꾸지 않는다.
- 포인트와 레벨, 실력 등급을 하나의 숫자 축으로 합치지 않는다.
- 서버 거래 유형이나 라우트가 없는 기능을 활성 버튼으로 그리지 않는다.
- 거래 사유 없는 `+30P`, `-10P` 숫자만 표시하지 않는다.
- 모바일에서 좌측 사이드바의 핵심 목적지를 숨긴 채 햄버거 메뉴에만 맡기지 않는다.

### 13.6 UX 근거

- **가시성:** 내 차례 수, 잔액, 공개 상태를 즉시 보여 시스템 상태를 추측하지 않게 한다.
- **Hick의 법칙:** 빈 상태와 상단 프롬프트에는 주 행동을 하나만 둔다.
- **Zeigarnik 효과:** 완료되지 않은 도전은 `내 차례`로 표면화하되 손실이나 수치심 문구는 쓰지 않는다.
- **Fogg 행동 모델:** 빈 상태 CTA는 친구 검색, 오답 다시 풀기, 스터디룸 찾기처럼 지금 할 수 있는 작은 행동으로 한정한다.
- **정직한 피드백:** 포인트 원장에는 이유, 시간, 출처, 증감을 함께 표시하며 포인트를 숙련도로 오해시키지 않는다.

### 13.7 정본 불일치와 회수

- 관련 wiki의 마이페이지 `DROPPED` 표기는 현재 구현과 2026-08-14 지시에 어긋난다. 기술설계 전 wiki 상태를 다시 열어 정정해야 한다.
- 결제·구독 라우트와 친구 도전장 포인트 차감 거래 유형은 현재 없다. 기술설계 합의 전 구현 범위에 넣지 않는다.

SKILLS_USED: 없음. 현재 런타임의 사용 가능 스킬 목록에 제품 화면 디자인 검수 스킬이 없어 `/Users/sj/.claude/standards/design.md` §14의 루브릭을 직접 적용했다.

SKILLS_SKIPPED: imagegen은 기존 구현과 프로토타입의 정합 감사에 래스터 생성이 필요하지 않아 사용하지 않았다. 마케팅 및 콘텐츠 스킬은 제품 UI 정본화 범위와 무관하다.

SOURCES:

- `prototypes/mvp-g-3역할-hub-v24.2-gpt-codex-20260829-1054.html`
- `docs/mvp-g/design-spec-v24.2-gpt-codex-20260829-1054.md`
- `docs/mvp-g/mvp-g-design-v24.1-independent-review-v1-gpt-codex-20260829-1051.md`
- `docs/qa/design-conformance-mvp-g-v2.0.1.md`
- `mvp-front/src/styles/globals.css`
- `mvp-front/src/features/dashboard/components/student/exam-hall-card.tsx`
- `mvp-back/src/main/java/com/example/demo/domain/exam/QuestionBankGrade.java`
- `mvp-front/src/entities/exam/infrastructure/exam.dto.ts`
- `mvp-front/src/features/exam/components/exam-create.tsx`
- `mvp-front/src/features/admin-question-bank/components/admin-question-bank.tsx`
- [Google Labs DESIGN.md spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md)
- [Playwright screenshots](https://playwright.dev/docs/screenshots)

MODEL: gpt-codex/gpt-5.6-sol

STAMP: line=mvp-g | version=v1.4.2 | release_candidate=v2.0.2 | generated=2026-08-29 10:54 KST | agent=product-designer | basis=PRD v2.4.2+v24.1+independent review C+ | decision=mobile one-column and clean-export contract correction

RUBRIC_SCORE: clarity=5/5 action=5/5 linebreak=5/5 tone=4/5 slop=5/5 total=24/25

WEAKEST_LINE: "학년은 유지한 채 난이도나 단원 조건을 바꿔 다시 찾아보세요.": 다음 행동은 분명하지만 난이도와 단원 중 무엇을 먼저 바꿀지는 사용자가 판단해야 한다.
