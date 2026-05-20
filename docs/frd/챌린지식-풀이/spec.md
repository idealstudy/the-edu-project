---
feature: 챌린지식-풀이
version: v1.1
status: drafted
updated: 2026-05-21
related_wiki_concept: "[[wiki/concepts/챌린지식-풀이]]"
related_backend_frd: "[[mvp-back:docs/frd/챌린지식-풀이/spec]]"
related_adr: [ADR-0004, ADR-0005, ADR-0009]
---

# 챌린지식 풀이 — Frontend FRD (v1.1)

## 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v1.0 | 2026-05-21 | 최초 작성 (Spec-Driven Dev 변형 8 sections) |
| **v1.1** | **2026-05-21** | 1차 MVP 핵심 채널 격상 + hint 트리거가 v2 대화형 위임 (`features/qna-ai-conversation`)으로 변경 (ADR-0009) |

---

## 1. Problem / Goal

6모 시즌 비로그인 학생을 챌린지로 유입시키고, 사고력 답변 구조를 실 사용에서 검증한다. 챌린지는 학생 획득 채널 + 학생 학습 경험 실증 컨테이너 이중 역할.

Success = 비로그인 챌린지 시작률 + 완주율 + 챌린지 → 가입 전환율.

## 2. User Scenarios

| 페르소나 | 시나리오 |
|---|---|
| **Public (비로그인)** | `/challenge` → 공개 챌린지 리스트 → 챌린지 카드 클릭 → 상세 (시작 전 안내) → "시작" → 로그인/가입 모달 → 풀이 진행 |
| **Student** | 풀이 진행 화면 → 문제 1 답 제출 → 채점 → 통과·실패 → 다음 문제 |
| **Student** | 막힘 → "디에듀 AI 힌트" → 1~5단계 점진 (사고력 답변 구조 위임) → 통과 또는 give-up |
| **Student** | 모든 문제 종결 → 결과 화면 (총점·통과수·사용한 힌트 단계 → 사고력 점수 가시화) |
| **Teacher** | `/teacher/studyrooms/{id}/challenge-attempts` → 학생별 진행도 + AI 로그 열람 |

## 3. Data Contract

Backend FRD §2 API 9개 매칭. 비로그인 path는 `/api/public/**`.

| Method | Path | Request | Response 핵심 |
|---|---|---|---|
| GET | `/api/public/challenges` | `?visibility=PUBLIC&page=&size=` | `Page<ChallengeListResponse>` (비로그인 OK) |
| GET | `/api/public/challenges/{id}` | — | `ChallengeDetailResponse` (문제 본문 제외) |
| POST | `/api/student/challenges/{id}/attempts` | — | `ChallengeAttemptResponse` (멱등) |
| GET | `/api/student/attempts/{attemptId}` | — | `ChallengeAttemptDetailResponse` (현재 문제 + 진행도) |
| POST | `/api/student/attempts/{aid}/problems/{pid}/submit` | `{ answer: string }` | `ChallengeSubmitResponse` (`passed`, `nextProblemId?`) |
| POST | `/api/student/attempts/{aid}/problems/{pid}/hint` | — | `QnaMessageResponse` (사고력 위임) |
| POST | `/api/student/attempts/{aid}/problems/{pid}/give-up` | — | `ChallengeProblemAttemptResponse` (5단계 힌트 후만) |
| GET | `/api/teacher/studyrooms/{id}/challenge-attempts` | `?status=` | `Page<ChallengeAttemptListResponse>` |
| GET | `/api/teacher/attempts/{attemptId}/log` | — | `ChallengeAttemptLogResponse` (QnA 로그 포함) |

## 4. FSD Mapping

### Route
- `app/(public)/challenge/` — 비로그인 리스트
- `app/(public)/challenge/[id]/` — 비로그인 상세 (시작 전 안내)
- `app/(private)/challenge/[id]/attempts/[attemptId]/` — 풀이 진행
- `app/(private)/challenge/[id]/attempts/[attemptId]/result/` — 결과
- `app/(private)/teacher/studyrooms/[id]/challenge-attempts/` — 선생님 모니터링

### Features
- `features/challenge-list-public` — 비로그인 리스트 (SEO 친화)
- `features/challenge-attempt-start` — 시작 + 가입 유도
- `features/challenge-problem-submit` — 답 제출 + 채점 결과 표시
- `features/challenge-hint-trigger` — 사고력 답변 구조 위임 호출
- `features/teacher-challenge-monitoring` — 학생 진행도 모니터링

### Widgets
- `widgets/challenge-card` — 리스트용 카드
- `widgets/challenge-progress` — 단계 인디케이터 (N/M 문제)
- `widgets/challenge-result` — 결과 화면 (사고력 점수 + 가입 CTA)
- `widgets/hint-side-panel` — 풀이 화면 사이드의 사고력 hint UI (사고력 widget 재사용)

### Entities
- `entities/challenge` — 신규 (`['challenge', 'list']`, `['challenge', id]`)
- `entities/challenge-attempt` — 신규 (`['attempt', attemptId]`)

### Shared
- Tiptap (문제 본문 렌더) · 27 UI 컴포넌트 · Tailwind v4

## 5. Edge Cases / Defer

| 항목 | 1차 MVP 처리 |
|---|---|
| 비로그인 시도 시작 | 로그인/가입 모달 + 가입 후 자동 시작 재개 |
| 동일 챌린지 진행 중 시도 재진입 | Backend 멱등 → 기존 attempt 반환, 클라이언트는 이어 진행 |
| 24h 무활동 → ABANDONED | 사용자에 "재시작" 버튼 노출 (새 attempt) |
| 5단계 힌트 후 give-up | 결과 화면에 "사고력 단계 X에서 포기"로 표시 |
| **defer**: open-ended 문제 LLM 채점 UX (대기/스트리밍) | 1차는 interface만, MULTIPLE_CHOICE·SHORT_ANSWER만 시드 |
| **defer**: 부정행위 방지 (정답 클라 노출 차단 외) | 1차 MVP 범위 외 |
| **defer**: 오프라인 모드 | v2 |
| **defer**: 결과 화면 SNS 공유 | v2 마케팅 |

## 6. Success Metrics

```
challenge_list_viewed          { source }                       # SEO/광고 인입
challenge_detail_viewed        { challengeId }
challenge_attempt_started      { challengeId, isAnonymous }
challenge_problem_submitted    { problemId, problemType, passed }
challenge_hint_triggered       { problemId, hintLevel }
challenge_abandoned            { problemId, hintLevelUsed }
challenge_completed            { challengeId, score, hintsUsed }
student_signup_from_challenge  { challengeId, fromStep }        # 가입 전환
```

Funnel: 리스트 → 상세 → 시도 → 완주 → 가입. 핵심 KPI = **public 시작률** + **완주율** + **가입 전환율**.

## 7. Related Specs

- Backend FRD: [[mvp-back:docs/frd/챌린지식-풀이/spec]]
- Wiki concept: [[wiki/concepts/챌린지식-풀이]]
- 의존 Frontend FRD: [[mvp-front:docs/frd/사고력-답변구조/spec]] (hint 트리거 시 위임)
- ADR: [[ADR-0004]], [[ADR-0005]], [[ADR-0008]] (challenge·homework 경계, 예정), [[ADR-0009]] (public API security, 예정)
- Figma: TBD
- E2E spec path: `mvp-front/tests/e2e/challenge-attempt.spec.ts` (작성 예정)

## 8. Open Questions

| 질문 | 의도 |
|---|---|
| 비로그인 챌린지 시도 시 가입 유도 시점 (시작 클릭 / 첫 답 제출 / 결과 화면)? | 전환율 vs UX 마찰 균형 |
| 결과 화면 가입 CTA UX (강제 모달 vs 부드러운 권유) | 6모 시즌 트래픽 측정 후 A/B |
| 챌린지 진행 중 이탈 후 재방문 시 자동 재개 vs 처음부터 | UX 일관성 vs 자유도 |
| open-ended 채점 결과 대기 시간 UX (로딩 / 폴링 / 이메일 알림) | LLM 비용·UX 트레이드오프 |
