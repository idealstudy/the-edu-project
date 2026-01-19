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
