# MVP-E v1.1.0 프론트 화면대조표

> STAMP — 생성: 2026-08-06 01:20 KST · 모델: gpt-5 Codex · 에이전트: code-builder · 스킬: create-query-hook, create-post-mutation, create-modal, handle-api-error · 기반: 승인 디자인 허브 v3, API 계약 rev.4, FDD rev.4/현재 파일 rev.5, 테스트 계획 rev.4 · 고민: 프로토타입의 사람 중심 대결 흐름을 기존 오픈챌린지 기능 삭제 없이 확장했다.

## 판정 기준

- 디자인 정본: `/Users/sj/sj_code_master/d-edu/prototypes/mvp-e-v1.1.0-디자인허브-v3-opus5.html`
- 구현 기준: 프로토타입의 화면 구조·한글 문구·상태와 회장 확정 D-14~D-16을 우선했다.
- 색과 간격: 기존 `globals.css` 토큰을 사용했다. 정복 지도에 빨간색을 사용하지 않았다.
- 접근성: 모달은 기존 Radix Dialog의 포커스 잠금·ESC·제목 연결을 유지했다.

## 화면대조표

| 프로토타입 화면명                     | 구현 파일 경로                                                            | 레이아웃 일치 |           문구 일치 |            상태변형 구현 | 차이와 사유                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------- | ------------: | ------------------: | -----------------------: | --------------------------------------------------------------------------------------------------------------------- |
| 1-1 도전 맥락이 있는 풀이 화면        | `src/features/open-challenge/components/solve/challenge-solve-client.tsx` |          일치 |                일치 |           기본·접힘·펼침 | 글로벌 앱 헤더와 기존 가변 AI 패널은 보존했다. 문제→선택지→손풀이 DOM 순서는 프로토타입대로 변경했다.                 |
| 1-2 상대가 아직 안 푼 상태            | 같은 파일                                                                 |          일치 |                일치 |                     구현 | `opponentSolvedAt`이 없으면 “상대가 푸는 중이에요”를 표시한다.                                                        |
| 1-3 상대 제출·내 결과 잠금            | 같은 파일                                                                 |          일치 |                일치 |                     구현 | 잠긴 값의 개수와 서버 `lockReason`만 표시해 컨닝 경계를 유지한다.                                                     |
| 1-6 둘 다 제출·잠금 해제              | `challenge-result-dialog.tsx`                                             |          일치 |                일치 |                     구현 | 실제 값은 결과 API가 열린 뒤에만 표시한다.                                                                            |
| 2-1 내가 이긴 결과                    | `challenge-result-dialog.tsx`                                             |          일치 |                일치 |                     구현 | 큰 승리 제목, 양쪽 답·시간·손풀이, 다시 붙기를 주 동작으로 구현했다.                                                  |
| 2-2 내가 진 결과                      | 같은 파일                                                                 |          일치 |                일치 |                     구현 | 축하 표현 없이 서버 `divergence.reason`을 먼저 표시하고 “이 유형 3문제 더 풀기”를 주 동작으로 뒀다.                   |
| 2-3 둘 다 틀린 결과                   | 같은 파일                                                                 |          일치 |                일치 |                     구현 | “무승부” 대신 “둘 다 걸렸어요”를 사용했다.                                                                            |
| 2-4 둘 다 맞힌 결과                   | 같은 파일                                                                 |          일치 |                일치 |                     구현 | `BOTH_CORRECT`를 서버 판정 그대로 표시한다.                                                                           |
| 2-5 결과 로딩·실패·컨닝 가드          | 같은 파일                                                                 |          일치 |                일치 |                     구현 | 로딩, 일반 실패, 진행 중, `CUNNING_GUARD_BLOCKED`를 분리했다.                                                         |
| 3-1 같은 단원의 다른 문제로 다시 붙기 | 같은 파일 + `use-social.ts`                                               |          일치 |                일치 |                     구현 | `POST .../{token}/rematch`만 호출하며 같은 문제 재전송 UI는 만들지 않았다.                                            |
| 3-2 대결 3건 상한                     | 같은 파일                                                                 |          일치 |                일치 |                     구현 | `INVITE_LIMIT_EXCEEDED`이면 내 차례 대결로 안내한다.                                                                  |
| 3-3 추천 후보 없음                    | 같은 파일                                                                 |          일치 |                일치 |                     구현 | `REMATCH_NO_CANDIDATE`이면 다른 단원 문제로 안내한다.                                                                 |
| 4-1 친구 목록                         | `friends-client.tsx`                                                      |          일치 |                일치 |        로딩·오류·빈·목록 | 사람을 한 행의 주인공으로 두고 이름·전적·내 차례를 표시한다.                                                          |
| 4-2 내 차례 상단 띠                   | 같은 파일                                                                 |          일치 |                일치 |                  0건·N건 | 가장 오래 기다린 대결로 바로 이동한다.                                                                                |
| 4-3 친구 없음                         | 같은 파일                                                                 |          일치 |      핵심 문구 일치 |                     구현 | 기존 친구 추가 폼은 회귀 방지를 위해 빈 상태 위에 유지했다.                                                           |
| 5-1 친구별 대결 기록                  | `friend-detail-client.tsx`                                                |          일치 |                일치 |                     구현 | 헤더→전적 4칸→자랑거리 띠→대결 목록→정복 지도 순서다.                                                                 |
| 5-2 햄버거 7항목                      | 같은 파일                                                                 |          일치 |                일치 |                     구현 | 계약이 있는 링크 복사·상세·혼자 풀기는 동작하며, API 계약이 없는 알림·취소·숨기기·신고는 자리를 유지한 채 비활성이다. |
| 5-3 아직 대결 없음                    | 같은 파일                                                                 |          일치 |                일치 |                     구현 | 첫 도전장 안내를 표시한다.                                                                                            |
| 5-4 아직 친구 아님                    | 같은 파일                                                                 |          일치 |                일치 |                     구현 | 대결 기록과 정복 지도를 잠그고 친구 요청을 주 동작으로 표시한다.                                                      |
| 5-5 상대 데이터 부족                  | 같은 파일                                                                 |          일치 |                일치 |                     구현 | 빈 값이 낮은 실력으로 읽히지 않도록 “아직 푼 문제가 적어요”를 표시한다.                                               |
| 5-6 정복 지도                         | 같은 파일                                                                 |          일치 | 회장 확정 문구 일치 |                     구현 | 단원별 내 막대+친구 막대를 나란히 표시하고, 빨간색·등수·총점을 제거했으며 “따라잡기 가까운 순”으로 정렬한다.          |
| 6-1 비회원 도전장 열기                | `challenge-invite-landing.tsx`                                            |          일치 |                일치 |           로딩·정상·만료 | 보낸 사람·보낸 시각·상대 제출 여부·문제 원문을 가입 벽보다 먼저 표시한다.                                             |
| 6-2 가입 없이 풀기                    | `challenge-solve-client.tsx`, `ai-coach-panel.tsx`                        |          일치 |                일치 |                     구현 | 선택지→손풀이→제출, 코치 남은 대화 3회를 표시한다.                                                                    |
| 6-3 즉시 채점·가입 벽                 | `signup-sheet.tsx`                                                        |          일치 |                일치 |                정답·오답 | 손풀이와 풀이 기록이 승격된다는 사실과 실제 7일 만료만 말한다.                                                        |
| 6-4 가입 후 기록 승격                 | `challenge-solve-client.tsx`, `use-social.ts`                             |          일치 |                일치 |           성공·중복 승격 | 복귀 URL의 `guestToken`으로 claim한다. 만료 실패는 가입 자체를 막지 않는다.                                           |
| 7-1 맞은·틀린 공개 풀이               | `solution-list.tsx`                                                       |          일치 | 회장 확정 문구 일치 |        맞음·틀림·빈·잠금 | 작성자 이름을 정오와 무관하게 표시하고 정오별 옷을 구분한다.                                                          |
| 7-2 내 풀이 내리기                    | 같은 파일                                                                 |          일치 |                일치 | 본인만·확인 모달·진행 중 | “화면에서만 사라지고 정오·시간·정복 지도는 유지”를 확인 전에 명시한다.                                                |

## 기능번호 ↔ 파일 매핑

| 기능                                     | 구현 파일                                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| F-01 코치 선제 첫 마디                   | `open-challenge.dto.ts`, `open-challenge.repository.ts`, `use-open-challenge.ts`, `ai-coach-panel.tsx`           |
| F-02 문제·답·손풀이 순서와 모바일 동작   | `challenge-solve-client.tsx`, `choice-list.tsx`(기존 유지)                                                       |
| F-03 도전 맥락·컨닝 잠금                 | `social.dto.ts`, `challenge-invite-landing.tsx`, `challenge-solve-client.tsx`                                    |
| F-04~F-08 문제 메타·정복 지도 연결       | `open-challenge.dto.ts`, `friend-detail-client.tsx`, 기존 tree query 재사용                                      |
| F-09 도전 목록 상태별 한 동작·7항목 메뉴 | `my-challenge-invites.tsx`, `friend-detail-client.tsx`                                                           |
| F-10 사람 중심 친구 목록·상세            | `friends-client.tsx`, `friends/[friendId]/page.tsx`, `friend-detail-client.tsx`                                  |
| F-11 친구 전용 정복 지도                 | `social.repository.ts`, `use-social.ts`, `friend-detail-client.tsx`                                              |
| F-12 대결 결과 4상태                     | `challenge-result-dialog.tsx`                                                                                    |
| F-13 다시 붙기·상한·후보 없음            | `social.repository.ts`, `use-social.ts`, `challenge-result-dialog.tsx`                                           |
| F-14 비회원 도전·3회 코치·claim          | `challenge-invite-landing.tsx`, `ai-coach-panel.tsx`, `signup-sheet.tsx`, social/open-challenge repository·hooks |
| F-15 정오 무관 공개·이름 표기            | `challenge-solve-client.tsx`, `solution-list.tsx`, open-challenge DTO/domain                                     |
| F-16 내 풀이 소프트 삭제                 | `open-challenge.repository.ts`, `use-open-challenge.ts`, `solution-list.tsx`                                     |

## 검증 및 미검증

- 테스트됨: `npm run check-types`, `npm run lint`, `bash .ai/hooks/ai-check.sh`, 더미 백엔드 URL을 주입한 `npm run build`.
- 테스트됨: 이번 변경 관련 대상 테스트 27/27. 전체 스위트 기준은 82/83이며, 기존 `wrong-answer.repository.test.ts` fixture가 교사 코멘트 필드를 누락한 unrelated 1건이 실패한다.
- 미검증: macOS 실행 샌드박스가 Chromium MachPort 등록을 거부해 실제 브라우저 스크린샷 대조는 실행하지 못했다. QA에서 실 API와 Playwright 스크린샷으로 재검증해야 한다.
- 계약 회수 필요: `POST /public/guest-coach-messages`와 게스트 채점 확장 요청의 필드별 JSON 예시가 API 계약 rev.4에 없다. 프론트는 FDD 시퀀스의 `guestToken/challengeId/message`, `guestToken/selectedAnswer/elapsedSeconds/drawingData`를 사용했다. 백엔드 구현과 필드명을 합치지 못하면 이 두 호출만 조정이 필요하다.
- 계약 회수 필요: 알림·도전장 취소·목록 숨기기·신고 엔드포인트가 승인 계약에 없어 메뉴 항목은 비활성으로만 재현했다.

## 프로토타입 이탈 diff

1. 기존 글로벌 헤더, AI 패널 리사이즈, 도전 내역, 친구 요청 폼은 삭제하지 않고 보존했다.
2. 프로토타입의 정복 지도 정렬은 “둘 다 진행 중 우선”이었으나, 회장 최신 확정 사양인 “따라잡기 가까운 순”이 우선이므로 거리 차 오름차순으로 구현했다.
3. 프로토타입의 네 메뉴 동작은 승인 API 계약이 없어 보이는 위치만 유지하고 비활성 처리했다. 가짜 성공 동작은 넣지 않았다.

## 셀프심문·레드팀

- 이 구현이 틀렸다면 가장 그럴듯한 이유는 화면이 아니라 게스트 요청 JSON 필드명이 백엔드와 다를 가능성이다. 그래서 해당 두 통로를 별도 회수 항목으로 격리했다.
- 까다로운 학생 관점에서 패배 화면이 재대결을 강요하고, 친구 정복 지도가 성적표처럼 읽힐 위험을 점검했다. 패배 주 동작을 추가 연습으로 두고, 지도는 내 값과 친구 값을 나란히 놓고 등수·총점·빨간색을 제거했다.

SKILLS_USED: create-query-hook(API 쿼리 키·enabled), create-post-mutation(뮤테이션·캐시 무효화), create-modal(Radix Dialog·pending 차단), handle-api-error(컨닝 가드와 실패 분리)

SOURCES: 승인 디자인 허브 v3 · API 계약 rev.4 · FDD rev.4/현재 파일 rev.5 · 테스트 계획 rev.4 · https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ · https://tanstack.com/query/v3/guides/query-invalidation

MODEL: gpt-codex/gpt-5
