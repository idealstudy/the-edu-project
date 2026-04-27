import { studyRoomRepository, studyRoomsQueryKey } from '@/entities/study-room';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateEnrollmentStatus = (studyRoomId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: 'OPEN' | 'OPERATING') =>
      studyRoomRepository.teacher.updateEnrollmentStatus(studyRoomId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studyRoomsQueryKey.detail(studyRoomId),
      });
    },
  });
};
