'use client';

import { useRouter } from 'next/navigation';

import {
  type AppendUnitNotePagesPayload,
  type UpdateUnitNotePagePayload,
  repository,
  unitNoteKeys,
} from '@/entities/unit-note';
import { PRIVATE, PUBLIC } from '@/shared/constants/route';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyUnitNoteError } from '@/shared/lib/errors/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const ERROR_REDIRECT_DELAY_MS = 1500;

export const useUnitNoteLibraryQuery = () =>
  useQuery({
    queryKey: unitNoteKeys.library(),
    queryFn: () => repository.getLibrary(),
  });

export const useUnitNoteDetailQuery = (nodeId: number) =>
  useQuery({
    queryKey: unitNoteKeys.detail(nodeId),
    queryFn: () => repository.getLibrary(nodeId),
    enabled: nodeId > 0,
  });

const useUnitNoteMutationError = () => {
  const router = useRouter();
  return (error: unknown) => {
    handleApiError(error, classifyUnitNoteError, {
      onContext: () =>
        setTimeout(
          () => router.replace(PRIVATE.DASHBOARD.UNIT_NOTES),
          ERROR_REDIRECT_DELAY_MS
        ),
      onAuth: () =>
        setTimeout(
          () => router.replace(PUBLIC.CORE.LOGIN),
          ERROR_REDIRECT_DELAY_MS
        ),
    });
  };
};

export const useAppendUnitNotePages = (nodeId: number) => {
  const queryClient = useQueryClient();
  const handleError = useUnitNoteMutationError();
  return useMutation({
    mutationFn: (input: AppendUnitNotePagesPayload) =>
      repository.appendPages(nodeId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: unitNoteKeys.all });
    },
    onError: handleError,
  });
};

export const useUpdateUnitNotePage = (nodeId: number) => {
  const queryClient = useQueryClient();
  const handleError = useUnitNoteMutationError();
  return useMutation({
    mutationFn: ({
      pageId,
      input,
    }: {
      pageId: number;
      input: UpdateUnitNotePagePayload;
    }) => repository.updatePage(nodeId, pageId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: unitNoteKeys.all });
    },
    onError: handleError,
  });
};

export const useDeleteUnitNotePage = (nodeId: number) => {
  const queryClient = useQueryClient();
  const handleError = useUnitNoteMutationError();
  return useMutation({
    mutationFn: (pageId: number) => repository.deletePage(nodeId, pageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: unitNoteKeys.all });
    },
    onError: handleError,
  });
};
