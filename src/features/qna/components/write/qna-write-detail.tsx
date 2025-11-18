'use client';

import Image from 'next/image';

import { useStudentStudyRoomsQuery } from '@/features/study-rooms';
import { ColumnLayout } from '@/layout/column-layout';

import QnAFormProvider from './qna-form-provider';
import WriteArea from './qna-write-area';

type Props = {
  studyRoomId: number;
};

export default function QnAWriteDetail({ studyRoomId }: Props) {
  const { data: studyRooms, isPending } = useStudentStudyRoomsQuery();
  const currStudyRoom =
    studyRooms?.find(({ id }) => id === studyRoomId)?.name ?? '';

  return (
    <>
      <ColumnLayout.Left>
        <div className="border-line-line1 flex flex-col gap-5 rounded-xl border bg-white p-10">
          <h3 className="font-headline1-heading">
            {!isPending && currStudyRoom}
          </h3>
          <Image
            src="/studyroom/study-room-profile.svg"
            alt="select-area"
            width={300}
            height={300}
          />
        </div>
      </ColumnLayout.Left>
      <ColumnLayout.Right>
        <QnAFormProvider>
          <WriteArea studyRoomId={studyRoomId} />
        </QnAFormProvider>
      </ColumnLayout.Right>
    </>
  );
}
