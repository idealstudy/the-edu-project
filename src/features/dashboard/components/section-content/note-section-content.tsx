import Link from 'next/link';

import { AddNoteIcon } from '@/shared/components/icons';
import { PRIVATE } from '@/shared/constants';

import MoreButton from './more-button';

interface NoteSectionContentProps {
  notes: {
    id: number;
    title: string;
    content: string;
    studyRoomId: number;
    studyRoomName: string;
  }[];
  isMore?: boolean;
  lastStudyRoomId: number;
}
const NoteSectionContent = ({
  notes,
  isMore = false,
  lastStudyRoomId,
}: NoteSectionContentProps) => {
  const hasStudyRooms = lastStudyRoomId > 0;

  return (
    <div className="flex w-full flex-col gap-3">
      {!hasStudyRooms && (
        <p className="font-body2-normal text-gray-8">
          상단을 참고해 스터디룸을 생성하고 학생을 초대한 후, 이용할 수 있어요.
        </p>
      )}

      {/* 추가하기 버튼 */}
      {hasStudyRooms && (
        <Link
          href={PRIVATE.NOTE.CREATE(lastStudyRoomId)}
          className="bg-gray-1 text-gray-7 border-gray-3 flex w-full items-center justify-center gap-1 rounded-lg border-1 px-8 py-3"
        >
          <AddNoteIcon
            className="h-6 w-6 shrink-0"
            aria-hidden
          />
          <span className="font-body2-normal">추가하기</span>
        </Link>
      )}

      {/* 노트 목록 */}
      {notes.map((note) => (
        <Link
          key={note.id}
          href={PRIVATE.NOTE.DETAIL(note.studyRoomId, note.id)}
          className="bg-orange-1 border-orange-3 flex w-full cursor-pointer flex-col items-start gap-1 rounded-lg border px-7 py-7 text-left"
        >
          <span className="font-label-heading text-orange-7">
            {note.studyRoomName}
          </span>
          <span className="font-body1-heading text-gray-12 mb-2 line-clamp-2 leading-tight">
            {note.title}
          </span>
          <span className="font-body2-normal text-gray-12 line-clamp-2 leading-tight">
            {note.content}
          </span>
        </Link>
      ))}

      {/* 더보기 버튼: 이동할 페이지가 없어 새로고침 처리 */}
      {isMore && <MoreButton href={'#'} />}
    </div>
  );
};

export default NoteSectionContent;
