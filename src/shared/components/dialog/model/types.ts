export type DialogScope =
  | 'group'
  | 'studyroom'
  | 'note'
  | 'invite'
  | 'qna'
  | 'homework'
  | 'notification'
  | 'profile';

export type DialogKind =
  | 'rename'
  | 'group-move'
  | 'delete'
  | 'onConfirm'
  | 'create'
  | 'invite'
  | 'select-representative';

export type DialogState =
  | { status: 'idle' }
  | {
      status: 'open';
      scope: DialogScope;
      kind: DialogKind;
      payload?: {
        noteId?: number;
        title?: string;
        initialTitle?: string;
        groupId?: number;
        studyRoomId?: number;
        homeworkId?: number;
      };
    };

export type DialogAction =
  | {
      type: 'OPEN';
      scope: DialogScope;
      kind: DialogKind;
      payload?: {
        noteId?: number;
        title?: string;
        initialTitle?: string;
        groupId?: number;
        studyRoomId?: number;
        homeworkId?: number;
      };
    }
  | { type: 'GO_TO_CONFIRM' }
  | { type: 'CLOSE' };
