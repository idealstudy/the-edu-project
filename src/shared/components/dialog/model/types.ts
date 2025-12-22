export type DialogScope = 'group' | 'studyroom' | 'note' | 'invite' | 'qna';

export type DialogKind =
  | 'rename'
  | 'group-move'
  | 'delete'
  | 'onConfirm'
  | 'create'
  | 'invite';

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
      };
    }
  | { type: 'GO_TO_CONFIRM' }
  | { type: 'CLOSE' };
