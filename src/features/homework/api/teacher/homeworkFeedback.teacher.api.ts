import { api } from '@/shared/api';

// POST 선생님이 제출한 과제를 피드백한다.
export const postTeacherHomeworkFeedback = async (
  studyRoomId: number,
  homeworkStudentId: number,
  body: { content: string }
) => {
  await api.private.post(
    `/teacher/study-rooms/${studyRoomId}/homework-students/${homeworkStudentId}/feedback`,
    body
  );
};

// DELETE 선생님이 제출한 과제의 피드백을 삭제한다.
export const removeTeacherHomeworkFeedback = async (
  studyRoomId: number,
  homeworkStudentId: number
) => {
  await api.private.delete(
    `/teacher/study-rooms/${studyRoomId}/homework-students/${homeworkStudentId}/feedback`
  );
};

// PATCH 선생님이 제출한 과제의 피드백을 수정한다.
export const updateTeacherHomeworkFeedback = async (
  studyRoomId: number,
  homeworkStudentId: number,
  body: { content: string }
) => {
  await api.private.patch(
    `/teacher/study-rooms/${studyRoomId}/homework-students/${homeworkStudentId}/feedback`,
    body
  );
};
