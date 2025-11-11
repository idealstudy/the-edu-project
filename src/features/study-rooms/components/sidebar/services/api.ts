// 수업노트 그룹 생성
import { authApi } from '@/shared/lib/http/http.client';

export const createStudyNoteGroup = async (params: {
  studyRoomId: number;
  title: string;
}) => {
  return await authApi.post(`/teacher/teaching-note-groups`, params);
};
// 수업노트 그룹 수정
export const updateStudyNoteGroup = async ({
  teachingNoteGroupId,
  title,
}: {
  teachingNoteGroupId: number;
  title: string;
}) => {
  return await authApi.put(
    `/teacher/teaching-note-groups/${teachingNoteGroupId}`,
    { title }
  );
};

// 수업노트 그룹 삭제
export const deleteStudyNoteGroup = async ({
  teachingNoteGroupId,
}: {
  teachingNoteGroupId: number;
}) => {
  return await authApi.delete(
    `/teacher/teaching-note-groups/${teachingNoteGroupId}`
  );
};

export const deleteStudyRoom = async ({
  studyRoomId,
}: {
  studyRoomId: number;
}) => {
  return await authApi.delete(`/teacher/study-rooms/${studyRoomId}`);
};
