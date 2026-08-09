'use client';

import { usePathname } from 'next/navigation';

import StudentDashboardHeader from './student-header';

/**
 * 학생 화면 셸 앱바.
 *
 * 승인 프로토타입 v22 규격 §2 "앱바 호출 규칙"(:1732-1744, :2078, :2301, :2711):
 * 모든 학생 화면이 본문 위 첫 줄에서 앱바를 부른다. 화면마다 다시 그리지 않는다.
 * 그래서 이 부품은 라우트 레이아웃에 한 번만 붙고, 제목은 경로로 정한다.
 */
const TITLE_BY_PATH: Array<[RegExp, string]> = [
  [/^\/dashboard\/student\/results\/?$/, '내 성과'],
  [/^\/dashboard\/student\/look-back\/?$/, '돌아보기'],
  [/^\/dashboard\/student\/wrong-answers(\/.*)?$/, '오답 회독'],
  [/^\/dashboard\/student\/unit-notes(\/.*)?$/, '단권화 노트'],
  [/^\/dashboard\/student\/exam-hall\/?$/, '응시장'],
  [/^\/dashboard\/student\/exams(\/.*)?$/, '시험 응시'],
];

export const studentAppBarTitle = (pathname: string): string => {
  const matched = TITLE_BY_PATH.find(([pattern]) => pattern.test(pathname));
  return matched ? matched[1] : '내 학습';
};

export const StudentAppBar = ({
  initialMemberName,
}: {
  initialMemberName?: string;
}) => {
  const pathname = usePathname() ?? '';

  return (
    <StudentDashboardHeader
      initialMemberName={initialMemberName}
      title={studentAppBarTitle(pathname)}
    />
  );
};

export default StudentAppBar;
