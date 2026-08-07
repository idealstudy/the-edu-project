import { revalidateStudyRoomList } from '@/app/(home)/list/study-rooms/actions';
import { studyRoomRepository } from '@/entities/study-room';
import { previewKeys } from '@/entities/study-room-preview';
import { teacherKeys } from '@/entities/teacher/infrastructure/teacher.keys';
import { StudyRoomsQueryKey } from '@/features/study-rooms/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateEnrollmentStatus = (studyRoomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: 'OPEN' | 'OPERATING' | 'CLOSED') =>
      studyRoomRepository.teacher.updateEnrollmentStatus(studyRoomId, status),
    onSuccess: () => {
      revalidateStudyRoomList();
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.teacherDetail(studyRoomId),
      });
      queryClient.invalidateQueries({
        queryKey: previewKeys.main(studyRoomId),
      });
      queryClient.invalidateQueries({
        queryKey: teacherKeys.dashboard.studyRoomList(),
      });
    },
  });
};
