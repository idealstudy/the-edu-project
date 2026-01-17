# GA4 이벤트 전체 목록

## 📊 추적 목적 및 흐름

### 추적 목적
서비스의 실제 사용 여부를 정확히 파악하여 다음을 측정합니다:
- **활성 사용자**: 단순 방문이 아닌 실제 행동을 하는 사용자
- **핵심 기능 활용도**: 스터디룸 생성 → 수업노트 작성 → 학생 초대 → 학생 참여의 전체 여정
- **이탈 지점**: 어디서 사용을 멈추는지 파악

### 추적 흐름

#### 1. 선생님 사용 흐름
```
회원가입 성공 (signup_success) ⭐
  → 로그인 성공 (login_success) ⭐
  → 대시보드 조회 (page_view) ✅
  → 스터디룸 생성 (create_click) ✅
  → 스터디룸 생성 성공 (create_success) ⭐ ✅
  → 수업노트 작성 진입 (create_enter) ✅
  → 수업노트 저장 (create_click) ✅
  → 수업노트 저장 성공 (create_success) ⭐ ✅
  → 학생 초대 (invite_click) ✅
  → 학생 초대 성공 (invite_success) ⭐ ✅
```

#### 2. 학생 참여 흐름
```
초대 수락 → 스터디룸 진입
  → 수업노트 조회 (studynote_click) ⭐
  → 질문 조회 (question_click) ⭐
  → 답글 작성 (reply_create_click) ⭐
  → 과제 제출 (homework_submit_click) ⭐
```

#### 3. 핵심 지표
- **완료율**: 클릭 대비 성공 비율 (예: 수업노트 작성 시도 vs 성공)
- **참여율**: 초대된 학생 중 실제 활동하는 학생 비율
- **이용 지속성**: 첫 사용 후 재방문 여부

### 필수 이벤트 (⭐필수)
다음 10개 이벤트는 서비스 사용 여부를 정확히 측정하기 위해 **반드시 필요**합니다:
1. 인증 (2개): 회원가입/로그인 성공
2. 페이지뷰 (2개): 어떤 페이지를 보는지
3. 핵심 행동 완료 (2개): 실제로 성공했는지
4. 학생 참여도 (4개): 학생이 실제로 활동하는지

---

> **참고**: 이 문서는 요구사항 문서의 모든 이벤트를 정리한 것입니다.  
> **구현 우선순위**: `*` 표시가 있는 이벤트만 우선 구현합니다.  
> **필수 항목**: `⭐필수` 표시는 서비스 사용 여부를 정확히 트래킹하기 위해 반드시 필요한 이벤트입니다.

## 📋 목차
1. [공통 파라미터](#공통-파라미터)
2. [GNB 이벤트](#gnb-이벤트)
3. [대시보드 이벤트](#대시보드-이벤트)
4. [페이지뷰 이벤트](#페이지뷰-이벤트)
5. [스터디룸 이벤트](#스터디룸-이벤트)
6. [수업노트 이벤트](#수업노트-이벤트)
7. [노트 그룹 이벤트](#노트-그룹-이벤트)
8. [학생 이벤트](#학생-이벤트)
9. [질문 이벤트](#질문-이벤트)
10. [과제 이벤트](#과제-이벤트)
11. [검색/필터 이벤트](#검색필터-이벤트)
12. [구현 상태 요약](#구현-상태-요약)

---

## 공통 파라미터

모든 이벤트에 공통으로 포함되는 파라미터:

| 파라미터명 | 타입 | 설명 |
|----------|------|------|
| `user_type` | `'teacher' \| 'student' \| 'guardian' \| 'not'` | 사용자 권한 (자동 추가됨) |

**주의**: 모든 헬퍼 함수는 `user_type`을 자동으로 추가하므로 별도로 전달할 필요가 없습니다.

---

## 인증 이벤트

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `signup_success` | `trackSignupSuccess` | - | ✅ 구현됨 | ⭐필수 |
| `login_success` | `trackLoginSuccess` | - | ✅ 구현됨 | ⭐필수 |

---

## GNB 이벤트

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `gnb_logo_click` | `trackGnbLogoClick` | - | ✅ 구현됨 | |
| `gnb_alarm_click` | `trackGnbAlarmClick` | - | ✅ 구현됨 | |
| `gnb_profile_click` | `trackGnbProfileClick` | - | ✅ 구현됨 | |
| `gnb_logout_click` | `trackGnbLogoutClick` | - | ✅ 구현됨 | |
| `gnb_menu_click` | `trackGnbMenuClick` | - | ✅ 구현됨 | |

---

## 대시보드 이벤트

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `dashboard_studyroom_create_click` | `trackDashboardStudyroomCreateClick` | - | ✅ 구현됨 | |
| `dashboard_main_banner_click` | `trackDashboardMainBannerClick` | - | ❌ 미연결 | |
| `dashboard_studynote_click` | `trackDashboardStudynoteClick` | - | ✅ 구현됨 | |

---

## 페이지뷰 이벤트 (예시)

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `dashboard_page_view` | `trackPageView('dashboard')` | - | ✅ 구현됨 | ⭐필수 |
| `studynote_detail_page_view` | `trackPageView('studynote_detail')` | - | ✅ 구현됨 | ⭐필수 |

---

## 스터디룸 이벤트

### 스터디룸 생성

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studyroom_create_click` * | `trackStudyroomCreateClick` | `user_id`, `title_length`, `description_length` | ✅ 구현됨 | |
| `studyroom_create_success` | `trackStudyroomCreateSuccess` | `user_id`, `title_length`, `description_length` | ✅ 구현됨 | ⭐필수 |

### 스터디룸 관리

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studyroom_student_invite_open` * | `trackStudyroomStudentInviteOpen` | `room_id` | ✅ 구현됨 | |
| `studyroom_title_update_open` | - | `room_id` | ❌ 미구현 | |
| `studyroom_title_update_click` * | `trackStudyroomTitleUpdateClick` | `room_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studyroom_title_update_success` | `trackStudyroomTitleUpdateSuccess` | `room_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studyroom_title_update_fail` | `trackStudyroomTitleUpdateFail` | `room_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studyroom_delete_open` | - | `room_id` | ❌ 미구현 | |
| `studyroom_delete_click` * | `trackStudyroomDeleteClick` | `room_id` | ✅ 구현됨 | |
| `studyroom_delete_success` | `trackStudyroomDeleteSuccess` | `room_id` | ❌ 미연결 | |
| `studyroom_delete_fail` | `trackStudyroomDeleteFail` | `room_id` | ❌ 미연결 | |
| `studyroom_delete_cancel_click` | `trackStudyroomDeleteCancelClick` | `room_id` | ❌ 미연결 | |

### 스터디룸 탭

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studyroom_studynote_tab_click` * | `trackStudyroomTabClick('studynote', ...)` | `room_id` | ✅ 구현됨 | |
| `studyroom_student_tab_click` * | `trackStudyroomTabClick('student', ...)` | `room_id` | ✅ 구현됨 | |
| `studyroom_question_tab_click` * | `trackStudyroomTabClick('question', ...)` | `room_id` | ✅ 구현됨 | |
| `studyroom_homework_tab_click` * | `trackStudyroomTabClick('homework', ...)` | `room_id` | ✅ 구현됨 | |

---

## 수업노트 이벤트

### 수업노트 작성

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studyroom_studynote_create_enter` * | `trackStudynoteCreateEnter` | `room_id`, `has_title`, `title_length` | ✅ 구현됨 | |
| `studynote_create_click` * | `trackStudynoteCreateClick` | `room_id`, `has_group`, `has_title`, `has_student`, `study_date`, `has_content`, `image_count`, `visibility` | ✅ 구현됨 | |
| `studynote_create_success` | `trackStudynoteCreateSuccess` | `room_id`, `group_id`, `has_title`, `has_student`, `date`, `has_content`, `visibility` | ✅ 구현됨 | ⭐필수 |
| `studynote_create_fail` | `trackStudynoteCreateFail` | `room_id`, `group_id`, `has_title`, `has_student`, `date`, `has_content`, `visibility` | ✅ 구현됨 | |

### 수업노트 조회/관리

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studyroom_studynote_click` * | `trackStudynoteClick` | `room_id`, `note_id` | ✅ 구현됨 | ⭐필수 |
| `studynote_update_open` | - | `room_id`, `note_id` | ❌ 미구현 | |
| `studynote_duplicate_click` * | `trackStudynoteDuplicateClick` | `room_id`, `note_id`, `group_id`, `has_title`, `has_student`, `date`, `has_content`, `visibility` | ❌ 미연결 | |
| `studynote_duplicate_success` | `trackStudynoteDuplicateSuccess` | `room_id`, `note_id`, `group_id`, `has_title`, `has_student`, `date`, `has_content`, `visibility` | ❌ 미연결 | |
| `studynote_duplicate_fail` | `trackStudynoteDuplicateFail` | `room_id`, `note_id`, `group_id`, `has_title`, `has_student`, `date`, `has_content`, `visibility` | ❌ 미연결 | |
| `studynote_delete_open` | - | `room_id`, `note_id` | ❌ 미구현 | |

---

## 노트 그룹 이벤트

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studynote_group_create_open` | - | `room_id` | ❌ 미구현 | |
| `studynote_group_create_click` * | `trackStudynoteGroupCreateClick` | `room_id`, `user_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_create_success` | `trackStudynoteGroupCreateSuccess` | `room_id`, `user_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_create_fail` | `trackStudynoteGroupCreateFail` | `room_id`, `user_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_update_open` | - | `room_id`, `group_id` | ❌ 미구현 | |
| `studynote_group_title_update_click` | `trackStudynoteGroupTitleUpdateClick` | `room_id`, `group_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_title_update_success` | `trackStudynoteGroupTitleUpdateSuccess` | `room_id`, `group_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_title_update_fail` | `trackStudynoteGroupTitleUpdateFail` | `room_id`, `group_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_delete_open` | - | `room_id`, `group_id` | ❌ 미구현 | |
| `studynote_group_delete_click` * | `trackStudynoteGroupDeleteClick` | `room_id`, `group_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_delete_success` | `trackStudynoteGroupDeleteSuccess` | `room_id`, `group_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_delete_fail` | `trackStudynoteGroupDeleteFail` | `room_id`, `group_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_delete_cancel_click` | `trackStudynoteGroupDeleteCancelClick` | `room_id`, `group_id`, `has_title`, `title_length` | ❌ 미연결 | |
| `studynote_group_click` | - | `room_id`, `group_id` | ❌ 미구현 | |
| `studynote_group_update_click` | - | `room_id`, `note_id`, `from_group_id`, `to_group_id` | ❌ 미구현 | |

---

## 학생 이벤트

### 학생 초대

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `student_invite_click` * | `trackStudentInviteClick` | `room_id`, `from_user_id`, `to_user_id` | ✅ 구현됨 | |
| `student_invite_success` | `trackStudentInviteSuccess` | `room_id`, `from_user_id`, `to_user_id` | ✅ 구현됨 | ⭐필수 |
| `student_invite_fail` | `trackStudentInviteFail` | `room_id`, `from_user_id`, `to_user_id` | ❌ 미연결 | |

### 학생 관리

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studyroom_student_profile_enter` * | `trackStudyroomStudentProfileEnter` | `room_id` | ❌ 미연결 | |
| `studyroom_student_remove_selected` | - | `room_id`, `student_id` | ❌ 미구현 | |
| `student_remove_confirmed` * | `trackStudentRemoveConfirmed` | `room_id`, `student_id` | ❌ 미연결 | |
| `studyroom_student_end_confirmed` * | `trackStudyroomStudentEndConfirmed` | `room_id`, `teacher_id`, `student_id` | ❌ 미연결 | |

---

## 질문 이벤트

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studyroom_question_create_enter` * | `trackStudyroomQuestionCreateEnter` | `room_id`, `has_title`, `title_length` | ✅ 구현됨 | |
| `studyroom_question_click` * | `trackQuestionClick` | `room_id`, `question_id` | ✅ 구현됨 | ⭐필수 |
| `question_create_click` * | `trackQuestionCreateClick` | `room_id`, `user_id`, `has_title`, `title_length`, `has_content`, `content_length` | ✅ 구현됨 | |
| `reply_create_click` * | `trackReplyCreateClick` | `room_id`, `question_id`, `user_id` | ✅ 구현됨 | ⭐필수 |

---

## 과제 이벤트

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studyroom_homework_create_enter` * | `trackStudyroomHomeworkCreateEnter` | `room_id`, `user_id` | ❌ 미연결 | |
| `studyroom_homework_click` * | `trackHomeworkClick` | `room_id`, `user_id` | ❌ 미연결 | |
| `homework_create_click` * | `trackHomeworkCreateClick` | `room_id`, `user_id`, `has_title`, `title_length`, `has_content`, `content_length`, `due_in_days` | ❌ 미연결 | |
| `homework_submit_click` * | `trackHomeworkSubmitClick` | `room_id`, `has_content`, `content_length`, `has_image`, `image_count` | 📅 구현 예정 | ⭐필수 |
| `homework_reply_create_click` | `trackHomeworkReplyCreateClick` | `room_id`, `has_content`, `content_length` | ❌ 미연결 | |

---

## 검색/필터 이벤트

| 이벤트명 | 함수명 | 파라미터 | 구현 상태 | 필수 |
|---------|--------|----------|----------|------|
| `studynote_list_arrange_filter_click` | `trackStudynoteListArrangeFilterClick` | `room_id`, `sort_method`, `page_size` | ❌ 미연결 | |
| `studynote_list_search_click` | `trackStudynoteListSearchClick` | `room_id`, `search_keyword` | ❌ 미연결 | |

---

## 사용 방법

### 기본 사용법

```typescript
import { trackGnbLogoClick } from '@/shared/lib/gtm/trackers';
import { useMemberStore } from '@/store';

const session = useMemberStore((s) => s.member);

// GNB 로고 클릭 이벤트
trackGnbLogoClick(session?.role ?? null);
```

### 파라미터가 필요한 이벤트

```typescript
import { trackStudynoteClick } from '@/shared/lib/gtm/trackers';

// 수업노트 클릭 이벤트
trackStudynoteClick(roomId, noteId, session?.role ?? null);
```

### 복잡한 파라미터가 필요한 이벤트

```typescript
import { trackStudynoteCreateClick } from '@/shared/lib/gtm/trackers';

// 수업노트 생성 클릭 이벤트
trackStudynoteCreateClick(
  {
    room_id: roomId,
    has_group: !!groupId,
    has_title: !!title,
    has_student: students.length > 0,
    study_date: date || null,
    has_content: !!content,
    image_count: imageCount,
    visibility: 'PUBLIC' | 'PRIVATE',
  },
  session?.role ?? null
);
```

---

## 주의사항

1. **user_type 자동 추가**: 모든 헬퍼 함수는 `user_type`을 자동으로 추가합니다.
2. **타입 안전성**: TypeScript 타입을 통해 파라미터가 올바른지 확인할 수 있습니다.
3. **SSR 안전**: `pushEvent` 함수는 SSR 환경에서 안전하게 동작합니다 (window 객체 체크).

---

**작성일**: 2025-12-29  
**작성자**: 조성진
**버전**: 1.0.0

