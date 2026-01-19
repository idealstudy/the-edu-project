import { StudyNoteQueryKey } from '@/entities/study-note';
import { StudyRoomsGroupQueryKey } from '@/entities/study-note-group/infrastructure';
import { StudyRoomDetail, StudyRoomsQueryKey } from '@/features/study-rooms';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

import {
  createStudyNoteGroup,
  deleteStudyNoteGroup,
  deleteStudyRoom,
  updateStudyNoteGroup,
  updateStudyRoom,
} from './api';

export const useCreateStudyNoteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudyNoteGroup,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          StudyRoomsGroupQueryKey.all,
          {
            pageable: { page: 0, size: 20, sort: ['desc'] },
            studyRoomId: variables.studyRoomId,
          },
          'ROLE_TEACHER',
        ],
      });
    },
  });
};

export const useUpdateStudyNoteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      teachingNoteGroupId: number;
      title: string;
      studyRoomId: number;
    }) => updateStudyNoteGroup(args),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          StudyRoomsGroupQueryKey.all,
          {
            pageable: { page: 0, size: 20, sort: ['desc'] },
            studyRoomId: variables.studyRoomId,
          },
          'ROLE_TEACHER',
        ],
      });

      queryClient.refetchQueries({
        queryKey: StudyNoteQueryKey.all,
      });

      queryClient.removeQueries({
        queryKey: StudyNoteQueryKey.all,
      });
    },
  });
};

export const useDeleteStudyNoteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { teachingNoteGroupId: number; studyRoomId: number }) =>
      deleteStudyNoteGroup(args),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          StudyRoomsGroupQueryKey.all,
          {
            pageable: { page: 0, size: 20, sort: ['desc'] },
            studyRoomId: variables.studyRoomId,
          },
          'ROLE_TEACHER',
        ],
      });

      queryClient.refetchQueries({
        queryKey: StudyNoteQueryKey.all,
      });

      queryClient.removeQueries({
        queryKey: StudyNoteQueryKey.all,
      });
    },
  });
};

export const useUpdateStudyRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: {
      studyRoomId: number;
      name: string;
      others: StudyRoomDetail;
    }) => updateStudyRoom(args),

    onMutate: async ({ studyRoomId, name }) => {
      // 이전 데이터 백업
      const previous = queryClient.getQueryData(
        StudyRoomsQueryKey.detail(studyRoomId)
      );

      // Optimistic Update: UI 즉시 반영
      queryClient.setQueryData<StudyRoomDetail | undefined>(
        StudyRoomsQueryKey.detail(studyRoomId),
        (old) => (old ? { ...old, name } : undefined)
      );

      return { previous };
    },

    onError: (_, variables, context) => {
      // 실패 시 롤백
      queryClient.setQueryData(
        StudyRoomsQueryKey.detail(variables.studyRoomId),
        context?.previous
      );
    },

    onSettled: (_, __, variables) => {
      // 서버 데이터와 동기화
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.detail(variables.studyRoomId),
      });

      // 사이드바 갱신
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.teacherList,
      });
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.studentList,
      });
    },
  });
};

export const useDeleteStudyRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { studyRoomId: number }) => deleteStudyRoom(args),

    onSuccess: (_, variables) => {
      const id = variables.studyRoomId;
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.teacherList,
      });
      queryClient.invalidateQueries({
        queryKey: StudyRoomsQueryKey.studentList,
      });
    },
  });
};
