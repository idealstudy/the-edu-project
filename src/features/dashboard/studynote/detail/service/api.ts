import { authApi } from '@/shared/lib/http';
import { CommonResponse } from '@/types/http';

import { StudyNoteDetail } from '../type';

export const getStudyNoteDetail = async (id: number) => {
  const response = await authApi.get<CommonResponse<StudyNoteDetail>>(
    `/public/teaching-notes/${id}`
  );

  return response.data;
};
