'use client';

import {
  type CreateChallengeInvitePayload,
  type FriendRequestByPhonePayload,
  type FriendRequestPayload,
  repository,
  socialKeys,
} from '@/entities/social';
import { showBottomToast } from '@/shared/components/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 친구
 * ────────────────────────────────────────────────────*/
export const useMyFriendsQuery = () =>
  useQuery({
    queryKey: socialKeys.friends(),
    queryFn: repository.getMyFriends,
  });

export const useSearchMembersQuery = (
  q: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: socialKeys.memberSearch(q),
    queryFn: () => repository.searchMembers(q),
    enabled: (options?.enabled ?? true) && q.trim().length > 0,
  });

export const useRequestFriendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FriendRequestPayload) => repository.requestFriend(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.friends() });
      showBottomToast('친구 요청을 보냈어요.');
    },
    onError: () => {
      showBottomToast('친구 요청에 실패했어요. 잠시 후 다시 시도해 주세요.');
    },
  });
};

// 전화번호로 친구요청 — 미존재 시 "회원을 찾을 수 없어요" 안내.
export const useRequestFriendByPhoneMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FriendRequestByPhonePayload) =>
      repository.requestFriendByPhone(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.friends() });
      showBottomToast('친구 요청을 보냈어요.');
    },
    onError: () => {
      showBottomToast(
        '그 전화번호의 회원을 찾을 수 없어요. 번호를 다시 확인해 주세요.'
      );
    },
  });
};

export const useAcceptFriendMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (friendshipId: number) =>
      repository.acceptFriend(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.friends() });
      showBottomToast('친구 요청을 수락했어요.');
    },
    onError: () => {
      showBottomToast('수락에 실패했어요. 잠시 후 다시 시도해 주세요.');
    },
  });
};

/* ─────────────────────────────────────────────────────
 * 도전장
 * ────────────────────────────────────────────────────*/
export const useMyChallengeInvitesQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: socialKeys.myInvites(),
    queryFn: repository.getMyInvites,
    enabled: options?.enabled ?? true,
  });

export const useCreateChallengeInviteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateChallengeInvitePayload) =>
      repository.createInvite(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.myInvites() });
    },
  });
};

export const usePublicInvitePreviewQuery = (
  token: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: socialKeys.invitePreview(token),
    queryFn: () => repository.getPublicInvitePreview(token),
    enabled: (options?.enabled ?? true) && token.length > 0,
    retry: false,
  });

export const useInviteResultQuery = (
  token: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: socialKeys.inviteResult(token),
    queryFn: () => repository.getInviteResult(token),
    enabled: (options?.enabled ?? true) && token.length > 0,
    retry: false,
  });

export const useAcceptChallengeInviteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => repository.acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.invitesAll() });
    },
  });
};
