---
feature: 사고력-답변구조
version: v0.2
status: drafted
updated: 2026-05-21
notion_version: v0.2
related_wiki_concept: "[[wiki/concepts/사고력-답변구조-v0.2]]"
related_backend_frd: "[[mvp-back:docs/frd/사고력-답변구조/spec]]"
related_adr: [ADR-0004, ADR-0005, ADR-0009, ADR-0010]
---

# 사고력 답변구조 — Frontend FRD (v0.2)

**Notion 매칭**: [v0.2 페이지](https://www.notion.so/365fbb391d7980398a7fd621849c3eb6)

## 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v0.1 | 2026-05-21 | 최초 작성 (단계형 힌트 카드 UI). `archive/spec-v0.1-2026-05-21.md` 보관 |
| **v0.2** | **2026-05-21** | **Breaking** — Notion v0.2 (ADR-0009). 대화형 thread UI + 학생 직접 답 선택 + 만족도 모달 + 컨텍스트 폼 단순화 |

> 버전은 Notion 페이지와 1:1 매칭 (ADR-0010).

---

## 1. Problem / Goal

학생이 챌린지 풀이에 막혔을 때 AI 대화형 코치가 multi-turn 질문으로 사고를 유도하고, 학생이 직접 답을 선택한다. 대화 종료 시 만족도(5점 + 자유 의견) 수집. Success = AI 대화 평균 turn 수 + 학생 답 선택률 + 만족도 점수 추세.

## 2. User Scenarios

| 페르소나 | 시나리오 |
|---|---|
| **Student** | 챌린지 문제에서 막힘 → "AI 코치 시작" 클릭 → AI 질문 표시 → 학생 답변 입력 → AI 반응 + 다음 질문 → multi-turn 반복 → 학생이 후보 중 답 선택 |
| **Student** | 대화 종료 시 만족도 모달 (5점 + 자유 의견 옵션) → 제출 또는 skip |
| **Student** | `/student/me/context` → "어려운 부분" 자유 텍스트 입력 (강점·취약점 필드는 v1 호환 read-only 표시) |
| **Teacher** | `/teacher/studyrooms/{id}/ai-inbox` → 학생 대화 로그 + 학생이 선택한 답 + 만족도 점수 확인 |
| **Teacher** | 메시지 단위 인라인 피드백 (그대로 유지) |

## 3. Data Contract

Backend FRD v2.0 §2 API 매칭. v1 API는 deprecated.

| Method | Path | Request | Response 핵심 |
|---|---|---|---|
| POST | `/api/v2/student/qna/{contextId}/ai-turn` | `{ userMessage: string }` | `QnaMessageResponse` (`actor='AI'`, `turnIndex`, `aiMessage`, `suggestedAnswers?: string[]`) |
| POST | `/api/v2/student/qna/{contextId}/ai-answer-selected` | `{ selectedAnswer: string, fromTurnIndex: number }` | `QnaContextResponse` (`aiStatus: 'RESOLVED'`, `selectedAnswer`) |
| POST | `/api/v2/student/qna/{contextId}/ai-rating` | `{ score: 1-5, comment?: string }` | `AiSatisfactionRatingResponse` |
| GET·PUT | `/api/student/me/context` | (PUT) `{ subject, learningStage, purposePriorities, difficulties, freeMemo }` | `StudentContextResponse` |
| GET | `/api/teacher/qna/{contextId}/ai-log` | — | turns + selectedAnswer + rating 포함 |

응답 시간: 첫 토큰 < 3초, 대화 turn 평균 5~8회. 스트리밍은 2차 MVP.

## 4. FSD Mapping

### Features (신규/변경)
- `features/qna-ai-hint` → **deprecated** (v1 호환 path만)
- `features/qna-ai-conversation` **신규** — "AI 코치 시작" + multi-turn 대화 thread + 입력 폼
- `features/qna-answer-selection` **신규** — AI suggestedAnswers 또는 자유 입력으로 학생 직접 답 선택
- `features/ai-satisfaction-rating` **신규** — 5점 + 자유 의견 모달 (대화 종료 시 자동 노출, skip 가능)
- `features/student-context-form` — `difficulties` 필드로 변경, `strengths`·`weaknesses` 는 v1 호환 read-only

### Widgets (신규/변경)
- `widgets/hint-step-card` → **deprecated**
- `widgets/conversation-thread` **신규** — AI turn ↔ 학생 turn 시간순 표시
- `widgets/answer-selection-panel` **신규** — suggestedAnswers 라디오 + "직접 입력" 옵션
- `widgets/satisfaction-modal` **신규** — 5점 별점 + 코멘트 영역

### Entities (TanStack Query keys)
- `entities/qna` — keys 확장: `['qna', contextId, 'turns']`, `['qna', contextId, 'rating']`
- `entities/student-context` — 폼 schema 변경 (`difficulties` 추가, `strengths`·`weaknesses` read-only)
- `entities/ai-satisfaction-rating` **신규** — `['ai-rating', contextId]`

### Shared
- `shared/ui/{modal, rating, textarea, radio-group}` — 27 UI 컴포넌트 활용
- Tiptap (자유 답변 입력에 활용 가능)

## 5. Edge Cases / Defer

| 항목 | 1차 MVP 처리 |
|---|---|
| LLM 호출 실패 | 토스트 + 재시도 (자동 retry 없음) |
| 대화 turn 한도 초과 (10턴) | "충분히 생각했어요" UI + 강제 답 선택 유도 |
| 학생이 답 선택 안 하고 이탈 | TanStack `keepPreviousData` + 다음 진입 시 대화 이어보기 |
| 만족도 모달 skip | aiStatus 그대로 (RESOLVED), 만족도 NULL |
| v1 학생 (강점·취약점 기존 입력) | 폼 read-only로 표시 + "어려운 부분으로 업데이트하세요" 안내 |
| **defer**: 스트리밍 응답 | 2차 MVP |
| **defer**: 대화 thread 검색 | v2.1 |
| **defer**: AI 답변 거부/신고 | v3 |

## 6. Success Metrics

```
ai_conversation_started      { contextId, source: 'challenge' | 'qna' }
ai_turn_completed            { turnIndex, userMessageLength, aiResponseTime }
ai_answer_selected           { fromTurnIndex, source: 'suggested' | 'custom' }
ai_conversation_abandoned    { lastTurnIndex }
ai_satisfaction_submitted    { score, hasComment, contextId }
ai_satisfaction_skipped      { contextId }
student_context_updated      { fieldsChanged: string[] }
```

핵심 KPI:
- 대화 평균 turn 수 (목표 5~8)
- 학생 답 선택률 (대화 시작 대비)
- 만족도 평균 (4점 이상 목표)
- v1 `/ai-hint` 호출량 감소 추세

Funnel: 챌린지 막힘 → AI 코치 시작 → turn 1·2·3 → 답 선택 → 만족도 제출.

## 7. Related Specs

- Backend FRD v2.0: [[mvp-back:docs/frd/사고력-답변구조/spec]]
- Wiki concept v2: [[wiki/concepts/사고력-답변구조-v2]]
- v1 archive (참고): [[mvp-front:docs/frd/사고력-답변구조/archive/spec-v1.0-2026-05-21]]
- ADR: [[ADR-0009]] v2 전환, [[ADR-0005]] versioning
- Figma: TBD (1차 MVP 디자인 시점 — Tiptap 자유 답변 입력 활용 검토)
- E2E spec path: `mvp-front/tests/e2e/qna-ai-conversation.spec.ts` (작성 예정)

## 8. Open Questions

| 질문 | 의도 |
|---|---|
| 대화 turn 10턴 초과 시 강제 답 선택 vs 추가 턴 허용? | 학생 자율성 vs 토큰 비용 |
| suggestedAnswers 후보 노출 시점 (모든 turn vs 마지막 3턴) | 사고 유도 vs UX 마찰 |
| 만족도 모달 노출 정책 (자동 노출 vs 명시 클릭) | 응답률 vs 학생 부담 |
| v1 학생 컨텍스트 (강점·취약점) 마이그레이션 UX | 자동 이관 vs 학생 직접 재입력 유도 |
