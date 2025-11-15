// 수업노트 그룹 생성
import { api } from '@/shared/api';

export const createStudyNoteGroup = async (params: {
  studyRoomId: number;
  title: string;
}) => {
  return await api.private.post(`/teacher/teaching-note-groups`, params);
};
// 수업노트 그룹 수정
export const updateStudyNoteGroup = async ({
  teachingNoteGroupId,
  title,
}: {
  teachingNoteGroupId: number;
  title: string;
}) => {
  return await api.private.put(
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
  return await api.private.delete(
    `/teacher/teaching-note-groups/${teachingNoteGroupId}`
  );
};

export const deleteStudyRoom = async ({
  studyRoomId,
}: {
  studyRoomId: number;
}) => {
  return await api.private.delete(`/teacher/study-rooms/${studyRoomId}`);
};
