# 챌린지식 풀이 — Frontend FRD Changelog

> 버전은 Notion 페이지와 1:1 매칭 ([[ADR-0010]]). breaking/minor 구분은 본문 표기.

## v0.2 (2026-05-21) — 🟢 **Minor**

- **Notion**: [v0.2 페이지](https://www.notion.so/365fbb391d7980398a7fd621849c3eb6)
- **ADR**: [[ADR-0009]] (사고력 v0.2 영향)
- **변경**:
  - 1차 MVP 핵심 채널로 격상 (비로그인 학생 유입)
  - 풀이 화면 hint 사이드 패널이 위임하는 features 변경: `qna-ai-hint` (v0.1) → `qna-ai-conversation` (v0.2)
  - `widgets/hint-side-panel` → `widgets/conversation-thread` 재사용
- **Archived spec**: [archive/spec-v0.1-2026-05-21.md](archive/spec-v0.1-2026-05-21.md) — Minor 변경이지만 사용자 의도 "v0.1·v0.2 모두 보이게"에 따라 명시적 보관
- **PR**: #294

---

## v0.1 (2026-05-21) — Initial

- **Notion**: [v0.1 페이지](https://www.notion.so/364fbb391d798050bc63dadfc0ae34bc)
- **변경**: 최초 작성 — `(public)/challenge` 비로그인 route + `(private)/challenge` 진행 화면 + 결과 화면 + 선생님 모니터링
- **PR**: #294 (이전 commit 259dd0eb 시점)
