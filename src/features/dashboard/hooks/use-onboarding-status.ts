import { useMemo } from 'react';

import { Role } from '@/entities/member';
import { useGetStudentHomeworkList } from '@/features/homework/hooks/student/useStudentHomeworkQuries';
import {
  useGetTeacherHomeworkDetail,
  useGetTeacherHomeworkList,
} from '@/features/homework/hooks/teacher/useTeacherHomeworkQuries';
import { useQnADetailQuery, useQnAsQuery } from '@/features/qna/services/query';
import { useGetTeacherNotesList } from '@/features/study-notes/hooks';
import type { StudentStudyRoom, StudyRoom } from '@/features/study-rooms';
import { useTeacherStudyRoomDetailQuery } from '@/features/study-rooms';
import { useMemberStore } from '@/store';
import { useQueryClient } from '@tanstack/react-query';

interface UseOnboardingStatusProps {
  role: Role | undefined;
  rooms: (StudyRoom | StudentStudyRoom)[] | undefined;
}

// TODO : 임시로 0번 스터디룸 혹은 0번 질문 기반으로 체크하도록 함.
// 수업노트, 질문, 과제, 피드백 전체 조회 API 들어오면 개선

/**
 * 온보딩 완료 여부를 체크하는 훅
 * 실제 데이터를 기반으로 각 단계의 완료 여부를 확인합니다.
 */
export const useOnboardingStatus = ({
  role,
  rooms,
}: UseOnboardingStatusProps) => {
  const queryClient = useQueryClient();
  const member = useMemberStore((s) => s.member);
  const isTeacher = role === 'ROLE_TEACHER';
  const hasRooms = rooms && rooms.length > 0;
  const firstRoomId = rooms?.[0]?.id;

  // 스터디룸 상세 정보 조회 (강사용 - 학생 목록, 수업노트 수, 질문 수 확인)
  const { data: roomDetail } = useTeacherStudyRoomDetailQuery(
    firstRoomId ?? 0,
    {
      enabled: isTeacher && !!firstRoomId,
    }
  );

  // 수업노트 목록 조회 (강사용)
  const { data: teacherNotes } = useGetTeacherNotesList({
    studyRoomId: firstRoomId ?? 0,
    pageable: { page: 0, size: 1, sortKey: 'LATEST_EDITED' },
    enabled: isTeacher && !!firstRoomId,
  });

  // QnA 목록 조회 (학생이 질문한 것 확인)
  const { data: qnaList } = useQnAsQuery(role, {
    studyRoomId: firstRoomId ?? 0,
    pageable: { page: 0, size: 20, sort: [] },
  });

  // 첫 번째 질문 상세 조회 (피드백 확인용 - 강사용)
  const firstQnAId = qnaList?.content?.[0]?.id;
  const { data: qnaDetail } = useQnADetailQuery(role, {
    studyRoomId: firstRoomId ?? 0,
    contextId: firstQnAId ?? 0,
  });

  // 과제 목록 조회 (강사용)
  const { data: teacherHomeworkList } = useGetTeacherHomeworkList(
    firstRoomId ?? 0,
    { page: 0, size: 20, sortKey: 'LATEST_EDITED' }
  );

  // 과제 목록 조회 (학생용)
  const { data: studentHomeworkList } = useGetStudentHomeworkList(
    firstRoomId ?? 0,
    { page: 0, size: 20, sortKey: 'LATEST_EDITED' }
  );

  // 첫 번째 과제 상세 조회 (피드백 확인용 - 강사용)
  const firstHomeworkId = teacherHomeworkList?.content?.[0]?.id;
  const { data: teacherHomeworkDetail } = useGetTeacherHomeworkDetail(
    firstRoomId ?? 0,
    firstHomeworkId ?? 0
  );

  // 학생의 경우 피드백 확인은 온보딩 단계가 아니므로 과제 상세 조회 불필요

  // React Query 캐시에서 추가 데이터 확인
  const checkFromCache = useMemo(() => {
    if (!firstRoomId) return null;

    // QnA 목록 캐시 확인 (학생이 질문했는지)
    const cachedQnaList = queryClient.getQueryData([
      'qnaList',
      role,
      {
        studyRoomId: firstRoomId,
        pageable: { page: 0, size: 1, sort: [] },
      },
    ]);

    // 수업노트 목록 캐시 확인
    const cachedNotes = queryClient.getQueryData([
      'teacherNotes',
      { studyRoomId: firstRoomId, pageable: { page: 0, size: 1, sort: [] } },
    ]);

    return {
      qnaList: cachedQnaList,
      notes: cachedNotes,
    };
  }, [firstRoomId, role, queryClient]);

  // 실제 데이터 기반으로 완료 여부 판단
  const hasStudents = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;

    // 강사: 스터디룸 상세 정보에서 학생 목록 확인
    if (isTeacher && roomDetail) {
      return roomDetail.studentNames && roomDetail.studentNames.length > 0;
    }

    // 학생: 스터디룸에 참여했다면 학생이 있는 것으로 간주
    return true;
  }, [hasRooms, firstRoomId, isTeacher, roomDetail]);

  const hasNotes = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;

    // 강사: 수업노트 목록 또는 상세 정보에서 확인
    if (isTeacher) {
      // PaginationData 타입 확인
      if (
        teacherNotes &&
        'content' in teacherNotes &&
        teacherNotes.content &&
        teacherNotes.content.length > 0
      ) {
        return true;
      }
      if (
        roomDetail?.numberOfTeachingNote &&
        roomDetail.numberOfTeachingNote > 0
      ) {
        return true;
      }
      // 캐시 확인
      if (checkFromCache?.notes) {
        return true;
      }
    }

    // 학생: 스터디룸에 참여했다면 수업노트가 있을 수 있다고 간주
    // (실제로는 수업노트 목록을 조회해야 하지만, 온보딩 단계에서는 스터디룸 참여만으로 충분)
    return true;
  }, [
    hasRooms,
    firstRoomId,
    isTeacher,
    teacherNotes,
    roomDetail,
    checkFromCache,
  ]);

  const hasQuestions = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;

    // 학생: QnA 목록에서 자신이 작성한 질문 확인
    if (!isTeacher) {
      // QnA 목록에서 현재 로그인한 학생이 작성한 질문이 있는지 확인
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
    }

    // 강사: 스터디룸 상세 정보에서 질문 수 확인
    if (isTeacher && roomDetail) {
      return roomDetail.numberOfQuestion > 0;
    }

    return false;
  }, [
    hasRooms,
    firstRoomId,
    isTeacher,
    qnaList,
    roomDetail,
    checkFromCache,
    member,
  ]);

  // 과제 완료 여부 판단
  const hasAssignments = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;

    // 강사: 과제 목록에서 확인
    if (isTeacher) {
      if (
        teacherHomeworkList?.content &&
        teacherHomeworkList.content.length > 0
      ) {
        return true;
      }
    }

    // 학생: 과제 목록에서 확인 (제출 여부는 상관없이 과제가 있으면 완료)
    if (!isTeacher) {
      if (
        studentHomeworkList?.content &&
        studentHomeworkList.content.length > 0
      ) {
        return true;
      }
    }

    return false;
  }, [
    hasRooms,
    firstRoomId,
    isTeacher,
    teacherHomeworkList,
    studentHomeworkList,
  ]);

  // 피드백 완료 여부 판단 (과제 피드백 + 질문 피드백)
  const hasFeedback = useMemo(() => {
    if (!hasRooms || !firstRoomId) return false;

    // 강사: 과제 피드백 또는 질문 피드백 확인
    if (isTeacher) {
      // 과제 피드백 확인
      if (teacherHomeworkDetail?.homeworkStudents) {
        const hasHomeworkFeedback = teacherHomeworkDetail.homeworkStudents.some(
          (student) =>
            student.feedback !== undefined && student.feedback !== null
        );
        if (hasHomeworkFeedback) {
          return true;
        }
      }

      // 질문 피드백 확인 (QnA 상세에서 messages가 있고, 강사가 답변했는지 확인)
      if (qnaDetail?.messages && qnaDetail.messages.length > 0) {
        const hasTeacherReply = qnaDetail.messages.some(
          (message) => message.authorType === 'ROLE_TEACHER'
        );
        if (hasTeacherReply) {
          return true;
        }
      }

      // QnA 목록에서 COMPLETED 상태인 질문이 있는지 확인
      if (qnaList?.content) {
        const hasCompletedQnA = qnaList.content.some(
          (qna) => qna.status === 'COMPLETED'
        );
        if (hasCompletedQnA) {
          return true;
        }
      }
    }

    // 학생: 피드백 확인은 불필요 (학생은 질문만 하면 되고, 피드백을 받는 것은 온보딩 단계가 아님)
    // 학생의 경우 피드백 단계는 온보딩에서 제외

    return false;
  }, [
    hasRooms,
    firstRoomId,
    isTeacher,
    teacherHomeworkDetail,
    qnaDetail,
    qnaList,
  ]);

  return {
    hasRooms,
    hasStudents,
    hasNotes,
    hasQuestions,
    hasAssignments,
    hasFeedback,
  };
};
