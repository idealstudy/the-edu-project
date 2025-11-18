import { api } from '@/shared/api';
import { CommonResponse } from '@/types/http';

import { StudyNoteDetail } from '../type';

export const getStudyNoteDetail = async (id: number) => {
  const response = await api.private.get<CommonResponse<StudyNoteDetail>>(
    `/public/teaching-notes/${id}`
  );

  return response.data;
};
