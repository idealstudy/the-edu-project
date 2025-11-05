import { studyroomApi } from '@/features/study-rooms/services/api';
import {
  InvitationQueryKey,
  StudyRoomsGroupQueryKey,
  getSearchInvitationOption,
  getStudentStudyRoomsOption,
} from '@/features/study-rooms/services/query-options';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 학생이 스터디룸(목록) 조회
export const useStudentStudyRoomsQuery = () => {
  return useQuery(getStudentStudyRoomsOption());
};

export const useCreateStudyRoomMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studyroomApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: StudyRoomsGroupQueryKey.all,
      });
    },
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('스터디룸 생성 실패:', error);
    },
  });
};

// 스터디룸 사용자(학생)초대
export const useSendInvitationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { studyRoomId: number; emails: string[] }) =>
      studyroomApi.invitations.send(args),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: InvitationQueryKey.all,
      });
    },
  });
};

export const useSearchInvitationQuery = (args: {
  studyRoomId: number;
  email: string;
  enabled: boolean;
}) => {
  return useQuery({
    ...getSearchInvitationOption(args),
    enabled: args.enabled ?? !!args.email?.trim(),
  });
};
