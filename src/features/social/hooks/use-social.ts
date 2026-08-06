'use client';

import {
  type CreateChallengeInvitePayload,
  type CreateGuestSessionPayload,
  type FriendRequestByPhonePayload,
  type FriendRequestPayload,
  repository,
  socialKeys,
} from '@/entities/social';
import { showBottomToast } from '@/shared/components/ui';
import { getApiError } from '@/shared/lib/get-api-error';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/* ─────────────────────────────────────────────────────
 * 친구
 * ────────────────────────────────────────────────────*/
export const useMyFriendsQuery = () =>
  useQuery({
    queryKey: socialKeys.friends(),
    queryFn: repository.getMyFriends,
  });

export const useFriendTurnSummaryQuery = () =>
  useQuery({
    queryKey: socialKeys.turnSummary(),
    queryFn: repository.getFriendTurnSummary,
  });

export const useFriendSummaryQuery = (
  friendId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: socialKeys.friendSummary(friendId),
    queryFn: () => repository.getFriendSummary(friendId),
    enabled: (options?.enabled ?? true) && friendId > 0,
    retry: false,
  });

export const useFriendMasteryQuery = (
  friendId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: socialKeys.friendMastery(friendId),
    queryFn: () => repository.getFriendMastery(friendId),
    enabled: (options?.enabled ?? true) && friendId > 0,
    retry: false,
  });

export const useFriendDuelsQuery = (
  friendId: number,
  cursor?: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: socialKeys.friendDuels(friendId, cursor),
    queryFn: () => repository.getFriendDuels(friendId, cursor),
    enabled: (options?.enabled ?? true) && friendId > 0,
    retry: false,
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
    mutationFn: (friendshipId: number) => repository.acceptFriend(friendshipId),
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

export const useCreateRematchMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => repository.createRematch(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.invitesAll() });
      queryClient.invalidateQueries({ queryKey: socialKeys.friends() });
      showBottomToast('같은 단원의 새 문제로 다시 붙었어요.');
    },
  });
};

export const useCreateGuestSessionMutation = () =>
  useMutation({
    mutationFn: (body: CreateGuestSessionPayload) =>
      repository.createGuestSession(body),
  });

export const useClaimGuestSessionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.claimGuestSession(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.all });
      showBottomToast('방금 푼 기록을 내 계정으로 옮겼어요.');
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (apiError?.code === 'GUEST_SESSION_ALREADY_CLAIMED') {
        showBottomToast('이 기록은 이미 다른 계정으로 옮겨졌어요.');
        return;
      }
      if (apiError?.code === 'GUEST_SESSION_OWNERSHIP_MISMATCH') {
        showBottomToast(
          '이 브라우저에서 푼 기록만 내 계정으로 옮길 수 있어요.'
        );
        return;
      }
      showBottomToast(apiError?.message ?? '풀이 기록을 옮기지 못했어요.');
    },
  });
};
