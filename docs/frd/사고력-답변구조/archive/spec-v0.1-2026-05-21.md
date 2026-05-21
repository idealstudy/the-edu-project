---
feature: 사고력-답변구조
version: v1.0
status: drafted
updated: 2026-05-21
related_wiki_concept: "[[wiki/concepts/사고력-답변구조]]"
related_backend_frd: "[[mvp-back:docs/frd/사고력-답변구조/spec]]"
related_adr: [ADR-0004, ADR-0005]
---

# 사고력 답변구조 — Frontend FRD

## 변경 이력

| 버전 | 날짜 | 내용 |
|---|---|---|
| v1.0 | 2026-05-21 | 최초 작성 (Spec-Driven Dev 변형 8 sections) |

---

## 1. Problem / Goal

학생이 질문 풀이에 막혔을 때 AI가 단계별 힌트로 사고를 유도하고, 선생님이 학생-AI 상호작용을 AI Inbox에서 확인·피드백한다. Success = AI 답변 단계별 학생 통과율 + 선생님 피드백 입력률.

## 2. User Scenarios

| 페르소나 | 시나리오 |
|---|---|
| **Student** | QnA 상세에서 "디에듀 AI 힌트" 클릭 → 1단계 힌트 표시 → 학생 재시도 → 막힘 → "다음 힌트" → 2~5단계 점진 노출 |
| **Student** | `/student/me/context` 진입 → 과목·학습단계·강점·취약점·자유메모 입력 → 저장. 이후 AI 힌트 프롬프트에 자동 주입 |
| **Teacher** | `/teacher/studyrooms/{id}/ai-inbox` → 정렬 미해결→미완료→해결 완료 → 특정 학생 QnA 진입 → 전체 로그 (학생·AI·선생님 actor) 열람 |
| **Teacher** | 메시지 단위 인라인 피드백 댓글 작성 → 학생에게 알림 → `aiStatus=RESOLVED` 자동 전환 |

## 3. Data Contract

Backend FRD §2 API 6개 매칭. 자세한 schema는 Backend FRD 참조.

| Method | Path | Request body | Response 핵심 |
|---|---|---|---|
| POST | `/api/student/qna/{contextId}/ai-hint` | `{ messageId: Long }` | `QnaMessageResponse` (`actor: 'AI'`, `hintLevel: 1~5`) |
| GET·PUT | `/api/student/me/context` | (PUT) `StudentContextUpdateRequest` | `StudentContextResponse` |
| GET | `/api/teacher/studyrooms/{id}/ai-inbox` | `?status=&sort=&page=&size=` | `Page<QnaListResponse>` |
| GET | `/api/teacher/qna/{contextId}/ai-log` | — | `List<QnaMessageResponse>` (actor 포함) |
| POST | `/api/teacher/qna/messages/{messageId}/feedback` | `{ body: string }` | `TeacherFeedbackResponse` |

응답 시간: AI 첫 토큰 < 3초, 전체 < 8초. 스트리밍은 2차 MVP.

## 4. FSD Mapping

### Features
- `features/qna-ai-hint` — "디에듀 AI 힌트" 버튼 + 호출 + 응답 카드 렌더
- `features/student-context-form` — 학생 컨텍스트 입력 폼 (CRUD)
- `features/teacher-ai-inbox` — 정렬·필터·페이지네이션
- `features/teacher-feedback-comment` — 메시지 단위 인라인 댓글

### Widgets
- `widgets/hint-step-card` — 단계별 힌트 카드 (1~5 표시, "다음 힌트" / "정답 보기" 버튼)
- `widgets/ai-log-viewer` — 학생·AI·선생님 actor 구분 타임라인

### Entities (TanStack Query keys)
- `entities/qna` — 기존 확장 (`['qna', contextId]`, `['qna', 'ai-hint', messageId]`)
- `entities/student-context` — 신규 (`['student-context', 'me']`)
- `entities/ai-inbox` — 신규 (`['ai-inbox', studyRoomId, filters]`)

### Shared
- `shared/ui/{badge, card, button, textarea}` 활용 — 27 UI 컴포넌트 일부

## 5. Edge Cases / Defer

| 항목 | 1차 MVP 처리 |
|---|---|
| LLM 호출 실패 | "잠시 후 다시" 토스트 + 재시도 버튼 (자동 retry 없음) |
| 동시 hint 호출 race condition | 클라이언트에서 hint 버튼 disable + Backend 멱등성 의존 |
| 5단계 후 추가 호출 | hint 버튼 비활성 + "정답 보기"만 노출 |
| 학생이 다른 탭에서 컨텍스트 수정 | TanStack `invalidateQueries` 로 새로고침 |
| **defer**: 스트리밍 응답 UI | 2차 MVP |
| **defer**: 선생님 피드백 후 학생 in-app 알림 배지 | 알림 시스템 별도 라운드 |
| **defer**: AI 답변 거부/신고 기능 | v2 |

## 6. Success Metrics

GA4 / Mixpanel 이벤트 (이름 잠정 — Track D 시점 확정):

```
ai_hint_requested        { contextId, hintLevel, studentSegment }
ai_hint_accepted         { hintLevel, timeSpent }
ai_hint_abandoned        { hintLevel, lastAction }
student_context_updated  { fieldsChanged: string[] }
teacher_ai_inbox_opened  { studyRoomId, pendingCount }
teacher_feedback_provided { hintLevel, bodyLength }
```

Funnel: 학생 막힘 → hint 1단계 요청 → 2~5단계 점진 → 통과 또는 give-up. 핵심 KPI = **단계별 통과율** + **선생님 피드백 입력률**.

## 7. Related Specs

- Backend FRD: [[mvp-back:docs/frd/사고력-답변구조/spec]]
- Wiki concept (추상): [[wiki/concepts/사고력-답변구조]]
- ADR: [[ADR-0004]] FRD 위치, [[ADR-0005]] 폴더 구조·workflow
- Figma: TBD (1차 MVP 시점)
- E2E spec path: `mvp-front/tests/e2e/qna-ai-hint.spec.ts` (작성 예정)

## 8. Open Questions

| 질문 | 의도 |
|---|---|
| hint 단계 skip 허용? (예: 학생이 4단계로 바로) | 사고력 코치 철학과 충돌 가능. 1차 MVP는 강제 순차 |
| 선생님 피드백 후 학생 알림 방식 (in-app vs email vs 둘 다) | 알림 시스템 통합 시점 결정 |
| 학생 컨텍스트 강점/취약점이 비어 있을 때 hint 동작 | LLM 프롬프트 default 적용 vs 입력 유도 토스트 |
| AI 답변 거부 시 fallback (선생님 직접 답변 모드) | v2 검토 |
