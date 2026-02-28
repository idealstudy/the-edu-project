import { studyRoomRepository } from '@/entities/study-room';
import { InvitationTokenQueryKey } from '@/features/study-rooms/api';
import { useQuery } from '@tanstack/react-query';

export const useInvitationQuery = (studyRoomId: number) =>
  useQuery({
    queryKey: InvitationTokenQueryKey.detail(studyRoomId),
    queryFn: () => studyRoomRepository.teacher.getInvitationToken(studyRoomId),
    retry: 3,
  });
