import { studyRoomRepository } from '@/entities/study-room';
import { teacherKeys } from '@/entities/teacher/infrastructure/teacher.keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type EnrollmentStatus = 'OPEN' | 'OPERATING' | 'CLOSED';

export const useChangeStudyRoomStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studyRoomId,
      status,
    }: {
      studyRoomId: number;
      status: EnrollmentStatus;
    }) =>
      studyRoomRepository.teacher.updateEnrollmentStatus(studyRoomId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: teacherKeys.dashboard.studyRoomList(),
      }),
  });
};
