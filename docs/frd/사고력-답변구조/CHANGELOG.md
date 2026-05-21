# 사고력 답변구조 — Frontend FRD Changelog

> 버전은 Notion 페이지와 1:1 매칭 ([[ADR-0010]]). breaking/minor 구분은 본문 표기.

## v0.2 (2026-05-21) — 🔥 **Breaking**

- **Notion**: [v0.2 페이지](https://www.notion.so/365fbb391d7980398a7fd621849c3eb6)
- **ADR**: [[ADR-0009]] 대화형 AI 코칭 채택
- **변경**:
  - 단계형 힌트 카드 UI → **대화형 thread UI**
  - Features: `features/qna-ai-hint` deprecated + `features/qna-ai-conversation`·`qna-answer-selection`·`ai-satisfaction-rating` 신규
  - Widgets: `widgets/hint-step-card` deprecated + `conversation-thread`·`answer-selection-panel`·`satisfaction-modal` 신규
  - Entities: `entities/student-context` 폼 schema 변경 (`difficulties` 추가, `strengths`·`weaknesses` read-only)
  - TanStack key 확장 (`['qna', contextId, 'turns']`, `['ai-rating', contextId]`)
- **Archived spec**: [archive/spec-v0.1-2026-05-21.md](archive/spec-v0.1-2026-05-21.md)
- **PR**: #294

---

## v0.1 (2026-05-21) — Initial

- **Notion**: [v0.1 페이지](https://www.notion.so/364fbb391d798050bc63dadfc0ae34bc)
- **변경**: 최초 작성 — 단계형 힌트 카드 + 학생 컨텍스트 폼 + 선생님 AI Inbox + 피드백 댓글
- **PR**: #294 (이전 commit `0ceb3259` 이전 상태)
