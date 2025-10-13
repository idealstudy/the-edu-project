import { studyroomApi } from '@/features/studyrooms/services/api';
import {
  InvitationQueryKey,
  StudyRoomsGroupQueryKey,
  getSearchInvitationOption,
} from '@/features/studyrooms/services/query-options';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
}) => {
  return useQuery({
    ...getSearchInvitationOption(args),
    enabled: !!args.email?.trim(),
  });
};
