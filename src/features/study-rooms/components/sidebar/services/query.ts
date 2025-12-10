import { StudyNoteQueryKey } from '@/entities/study-note';
import {
  StudyRoomDetail,
  StudyRoomsGroupQueryKey,
  StudyRoomsQueryKey,
} from '@/features/study-rooms';
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [StudyRoomsGroupQueryKey.all],
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [StudyRoomsGroupQueryKey.all],
      });

      queryClient.invalidateQueries({
        queryKey: [StudyNoteQueryKey.byGroupId],
      });
    },
  });
};

export const useDeleteStudyNoteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { teachingNoteGroupId: number; studyRoomId: number }) =>
      deleteStudyNoteGroup(args),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [StudyRoomsGroupQueryKey.all],
      });

      queryClient.invalidateQueries({
        queryKey: [StudyNoteQueryKey.byGroupId],
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
  return useMutation({
    mutationFn: (args: { studyRoomId: number }) => deleteStudyRoom(args),
  });
};
