import { CommonResponse, apiClient } from '@/lib/api';

import { StudyNoteDetail } from '../type';

export const getStudyNoteDetail = async (id: number) => {
  const response = (
    await apiClient.get<CommonResponse<StudyNoteDetail>>(
      `/public/teaching-notes/${id}`
    )
  ).data;

  return response.data;
};
