export type QnaErrorType = 'FIELD' | 'CONTEXT' | 'AUTH' | 'UNKNOWN';

export function classifyQnaError(code?: string): QnaErrorType {
  switch (code) {
    // FIELD (폼에서 복구 가능)
    case 'TEACHING_NOTE_STUDY_ROOM_MISMATCH':
    case 'TEACHING_NOTE_NOT_FOUND':
      return 'FIELD';

    // CONTEXT (리소스 소멸 / 페이지 무효)
    case 'QNA_CONTEXT_NOT_FOUND':
    case 'QNA_MESSAGE_NOT_FOUND':
    case 'STUDY_ROOM_NOT_EXIST':
      return 'CONTEXT';

    // AUTH (권한 문제)
    case 'STUDENT_NOT_IN_STUDY_ROOM':
    case 'MEMBER_NOT_EXIST':
    case 'QNA_MESSAGE_UPDATE_FORBIDDEN':
    case 'QNA_MESSAGE_DELETE_FORBIDDEN':
    case 'QNA_CONTEXT_UPDATE_FORBIDDEN':
      return 'AUTH';

    default:
      return 'UNKNOWN';
  }
}
