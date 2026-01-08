import type { StudentStudyRoom, StudyRoom } from '@/features/study-rooms';

interface UseOnboardingStatusProps {
  rooms: (StudyRoom | StudentStudyRoom)[] | undefined;
}

/**
 * 온보딩 완료 여부를 체크하는 훅
 * 스터디룸 존재 여부만 확인하고, 각 스터디룸별 상세 체크는 하지 않음
 * (전체 조회 API가 없으므로 스터디룸 존재 여부만으로 판단)
 */
export const useOnboardingStatus = ({ rooms }: UseOnboardingStatusProps) => {
  const hasRooms = rooms && rooms.length > 0;

  // 스터디룸이 있으면 기본적으로 온보딩 완료로 간주
  // 실제 데이터는 스터디룸 상세 페이지에서 확인
  // TODO: 전체 조회 API가 생기면 여기서 체크하도록 변경
  const hasNotes = hasRooms; // 스터디룸이 있으면 수업노트 작성 가능하다고 간주
  const hasQuestions = hasRooms; // 스터디룸이 있으면 질문 가능하다고 간주
  const hasStudents = hasRooms; // 스터디룸이 있으면 학생 초대 가능하다고 간주
  const hasAssignments = false; // 과제 API 필요
  const hasFeedback = false; // 피드백 API 필요

  return {
    hasRooms,
    hasStudents,
    hasNotes,
    hasQuestions,
    hasAssignments,
    hasFeedback,
  };
};
