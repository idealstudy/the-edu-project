import { PRIVATE } from '@/shared/constants';
import { type Page, expect } from '@playwright/test';

// 로그인
export async function loginAsTeacher(page: Page) {
  await page.goto('/login');
  await page
    .getByTestId('login-email-input')
    .fill(process.env.E2E_TEACHER_EMAIL!);
  await page
    .getByTestId('login-password-input')
    .fill(process.env.E2E_TEACHER_PASSWORD!);
  await page.getByTestId('login-submit-button').click();

  await page.waitForURL(PRIVATE.DASHBOARD.TEACHER);
  await expect(page).toHaveURL(PRIVATE.DASHBOARD.TEACHER);
}

type StudyRoomLike = { id?: number; name?: string; studentCount?: number };

/**
 * 스터디룸을 고른다. 목록의 첫 번째를 그냥 집으면 안 된다.
 *
 * dev 계정은 QA 가 돌 때마다 만들어진 일회용 방이 쌓인다(2026-08-23 실측: 학생 21개,
 * 선생님 23개). 그 중 첫 번째는 학생 1명짜리 빈 방이라, 과제 검사가 "학생을 지정할 수
 * 없다"거나 "오늘 할 일이 없다"로 계속 실패했다. 제품 결함이 아니라 방을 잘못 고른 것이다.
 *
 * 고르는 순서
 *   1) E2E_TEST_STUDY_ROOM_ID 가 있고 목록에 있으면 그것. 검사 대상 방을 못 박는 정공법이다.
 *   2) 없으면 일회용 QA 방(이름이 QA- 로 시작)을 걸러낸다.
 *   3) 남은 것 중 학생이 가장 많은 방. 실제로 수업이 도는 방이라는 뜻이다.
 *      학생 수를 안 주는 응답이면 남은 것 중 첫 번째.
 */
export function pickStudyRoomId(rooms: StudyRoomLike[], role: string): number {
  const pinned = Number(process.env.E2E_TEST_STUDY_ROOM_ID);
  if (Number.isSafeInteger(pinned) && pinned > 0) {
    // 고정값이 목록에 "있다"는 것만으로는 부족하다. 그 방이 일회용 QA 방이면 검사가
    // 그대로 실패한다(2026-08-23 CI 실측: 고정값이 목록에 있는데도 과제 검사가 계속
    // 죽었다. 가리키던 방이 학생 없는 빈 방이었다). 쓸 만한 방일 때만 존중한다.
    const room = rooms.find((r) => Number(r.id) === pinned);
    const usablePin =
      room &&
      !/^QA-/i.test(String(room.name ?? '')) &&
      (room.studentCount ?? 1) > 0;
    if (usablePin) return pinned;
    // 고정값이 낡았다고 검사를 죽이지 않는다. 그 값은 오래 방치되기 쉽고(로컬 .env 에
    // 예시값 1 이 남아 있던 실측 사례), 낡은 설정 하나로 과제 검사 전체가 멈추는 편이
    // 잘못 고른 방으로 도는 것보다 나쁘다. 알리고 아래 규칙으로 넘어간다.
    // eslint-disable-next-line no-console -- 검사 로그에 남겨야 다음 사람이 낡은 고정값을 안다
    console.warn(
      `[e2e] E2E_TEST_STUDY_ROOM_ID=${pinned} 를 ${role} 검사에 쓸 수 없다(${
        room
          ? `이름 "${room.name}", 학생 ${room.studentCount ?? '미상'}명`
          : '목록에 없음'
      }). 무시하고 실제 수업 방을 고른다. 목록 id: ${rooms.map((r) => r.id).join(', ')}`
    );
  }

  const usable = rooms.filter((r) => !/^QA-/i.test(String(r.name ?? '')));
  const pool = usable.length > 0 ? usable : rooms;
  const best = pool.reduce<StudyRoomLike | undefined>((acc, r) => {
    if (!acc) return r;
    return (r.studentCount ?? 0) > (acc.studentCount ?? 0) ? r : acc;
  }, undefined);

  const id = Number(best?.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error(
      `${role} 이 쓸 수 있는 스터디룸이 없다. 받은 방 ${rooms.length}개, ` +
        `일회용 QA 방을 뺀 뒤 ${usable.length}개.`
    );
  }
  return id;
}

export async function findOwnedStudyRoomId(page: Page): Promise<number> {
  // 대시보드의 첫 링크를 긁지 않고 목록을 받아서 고른다. 첫 링크는 일회용 QA 방일 수 있다.
  const response = await page.request.get('/api/v1/teacher/study-rooms');
  expect(response.ok()).toBe(true);
  const body = await response.json();
  const raw = body?.data ?? body;
  const rooms = Array.isArray(raw) ? raw : (raw?.content ?? []);
  return pickStudyRoomId(rooms, '선생님');
}

export async function findJoinedStudyRoomId(page: Page): Promise<number> {
  const response = await page.request.get('/api/v1/student/study-rooms');
  expect(response.ok()).toBe(true);
  const body = await response.json();
  const raw = body?.data ?? body;
  const rooms = Array.isArray(raw) ? raw : (raw?.content ?? []);
  return pickStudyRoomId(rooms, '학생');
}

export async function loginAsStudent(page: Page) {
  await page.goto('/login');
  await page
    .getByTestId('login-email-input')
    .fill(process.env.E2E_STUDENT_EMAIL!);
  await page
    .getByTestId('login-password-input')
    .fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByTestId('login-submit-button').click();

  // 2.0: 학생 로그인은 /learning(개인 학습 허브)로 랜딩한다(ADR-0019).
  // /dashboard/student(1.0 학생 대시보드)도 살아 있어, 둘 중 하나면 통과.
  await page.waitForURL(/\/(learning|dashboard\/student)(\?|$)/);
}

/**
 * 검사에 쓸 스터디룸에 E2E 학생이 들어가 있게 만든다.
 *
 * 이 검사들은 "선생님 방에 학생이 있다"는 씨앗 데이터에 의존해 왔는데, 그 데이터가
 * 환경마다 다르다(2026-08-24 실측: 개발 서버에선 학생이 21개 방에 속해 있었지만
 * CI 계정은 **0개**였다. 그래서 고를 방 자체가 없어 계속 실패했다).
 *
 * 씨앗 데이터가 맞기를 기대하는 대신 검사가 스스로 만든다. 이미 들어가 있으면
 * 서버가 STUDY_ROOM_NO_NEW_INVITE 를 주는데, 그건 실패가 아니라 원하는 상태다.
 *
 * 선생님으로 로그인된 페이지에서 호출해야 한다.
 */
export async function ensureStudentEnrolled(
  page: Page,
  studyRoomId: number
): Promise<void> {
  const email = process.env.E2E_STUDENT_EMAIL;
  if (!email) return;

  const response = await page.request.post(
    `/api/v1/teacher/study-rooms/${studyRoomId}/members`,
    { data: { studentEmailList: [email] } }
  );

  if (response.ok()) return;

  const body = await response.text();
  if (body.includes('STUDY_ROOM_NO_NEW_INVITE')) return; // 이미 멤버다

  throw new Error(
    `스터디룸 ${studyRoomId} 에 E2E 학생을 넣지 못했다. ` +
      `응답 ${response.status()}: ${body.slice(0, 200)}`
  );
}
