import { useMemo } from 'react';

import { useGetStudentHomeworkList } from '@/features/homework/hooks/student/useStudentHomeworkQuries';
import { useQnAsQuery } from '@/features/qna/services/query';
import { useGetStudentNotesList } from '@/features/study-notes/hooks';
import type { StudentStudyRoom } from '@/features/study-rooms';
import { useMemberStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';

interface UseStudentOnboardingStatusProps {
  rooms: StudentStudyRoom[] | undefined;
}

// TODO : 임시로 0번 스터디룸 혹은 0번 질문 기반으로 체크하도록 함.
// 수업노트, 질문, 과제, 피드백 전체 조회 API 들어오면 개선

/**
 * 학생 온보딩 완료 여부를 체크하는 훅 (학생 전용)
 * 실제 데이터를 기반으로 각 단계의 완료 여부를 확인합니다.
 * 강사는 useTeacherOnboardingQuery를 사용하세요.
 * !) 본래 학생, 강사 공용으로 사용되던 훅이었으나, 강사 온보딩이 개선됨에 따라 학생 전용으로 변경되었습니다.
 */
export const useOnboardingStatus = ({
  rooms,
}: UseStudentOnboardingStatusProps) => {
  const queryClient = useQueryClient();
  const member = useMemberStore((s) => s.member);
  const hasRooms = rooms && rooms.length > 0;
  const firstRoomId = rooms?.[0]?.id;

  // 수업노트 목록 조회 (학생용)
  const { data: studentNotes } = useGetStudentNotesList({
    studyRoomId: firstRoomId ?? 0,
    pageable: { page: 0, size: 1, sortKey: 'LATEST_EDITED' },
    enabled: !!firstRoomId,
  });

  // QnA 목록 조회 (학생이 질문한 것 확인)
  const { data: qnaList } = useQnAsQuery('ROLE_STUDENT', {
    studyRoomId: firstRoomId ?? 0,
    pageable: { page: 0, size: 20, sort: [] },
    enabled: !!firstRoomId,
  });

  // 과제 목록 조회 (학생용)
  const { data: studentHomeworkList } = useGetStudentHomeworkList(
    firstRoomId ?? 0,
    { page: 0, size: 20, sortKey: 'LATEST_EDITED' }
  );

  // React Query 캐시에서 추가 데이터 확인
  const checkFromCache = useMemo(() => {
    if (!firstRoomId) return null;

    const cachedQnaList = queryClient.getQueryData([
      'qnaList',
      'ROLE_STUDENT',
      {
        studyRoomId: firstRoomId,
        pageable: { page: 0, size: 1, sort: [] },
      },
    ]);

    return {
      qnaList: cachedQnaList,
    };
  }, [firstRoomId, queryClient]);

  // 학생: 스터디룸에 참여했다면 학생이 있는 것으로 간주
  const hasStudents = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;
    return true;
  }, [hasRooms, firstRoomId]);

  // 학생: 수업노트 목록에서 실제로 수업노트가 있는지 확인
  const hasNotes = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;
    if (
      studentNotes &&
      'content' in studentNotes &&
      studentNotes.content &&
      studentNotes.content.length > 0
    ) {
      return true;
    }
    return false;
  }, [hasRooms, firstRoomId, studentNotes]);

  // 학생: QnA 목록에서 자신이 작성한 질문 확인
  const hasQuestions = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;

    if (
      qnaList &&
      'content' in qnaList &&
      qnaList.content &&
      qnaList.content.length > 0
    ) {
      const studentName = member?.name;
      if (studentName) {
        const hasMyQuestion = qnaList.content.some(
          (qna) => qna.authorName === studentName
        );
        if (hasMyQuestion) {
          return true;
        }
      }
    }
    // 캐시 확인
    if (checkFromCache?.qnaList) {
      const cachedData = checkFromCache.qnaList as {
        content?: Array<{ authorName: string }>;
      };
      if (cachedData?.content && Array.isArray(cachedData.content)) {
        const studentName = member?.name;
        if (studentName) {
          const hasMyQuestion = cachedData.content.some(
            (qna) => qna.authorName === studentName
          );
          if (hasMyQuestion) {
            return true;
          }
        }
      }
    }

    return false;
  }, [hasRooms, firstRoomId, qnaList, checkFromCache, member]);

  // 학생: 과제 목록에서 제출한 과제가 있는지 확인
  const hasAssignments = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;

    if (
      studentHomeworkList?.content &&
      studentHomeworkList.content.length > 0
    ) {
      // 제출한 과제가 있는지 확인 (SUBMIT 또는 LATE_SUBMIT 상태)
      const hasSubmitted = studentHomeworkList.content.some(
        (homework) =>
          homework.status === 'SUBMIT' || homework.status === 'LATE_SUBMIT'
      );
      if (hasSubmitted) {
        return true;
      }
    }

    return false;
  }, [hasRooms, firstRoomId, studentHomeworkList]);

  // 학생: 피드백 확인은 온보딩 단계가 아님
  const hasFeedback = false;

  return {
    hasRooms,
    hasStudents,
    hasNotes,
    hasQuestions,
    hasAssignments,
    hasFeedback,
  };
};
