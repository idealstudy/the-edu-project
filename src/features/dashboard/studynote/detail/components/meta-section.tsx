import Image from 'next/image';

import { ColumnLayout } from '@/layout/column-layout';

import { getStudyNoteDetail } from '../service/api';

const StudyNoteDetailMetaSection = async ({ id }: { id: string }) => {
  const { studyRoomName, title, studentInfos, visibility } =
    await getStudyNoteDetail(Number(id));

  const visibilityText =
    visibility === 'PUBLIC' ? '수업대상 공개' : '수업대상 비공개';

  return (
    <ColumnLayout.Left className="border-line-line1 !static top-0 h-fit space-y-5 rounded-xl border bg-white p-20">
      <div className="text-key-color-primary font-body1-normal">
        {studyRoomName}
      </div>
      <h1 className="text-text-main font-headline1-heading">{title}</h1>
      <hr className="border-line-line1 border" />
      <div className="space-y-4">
        {/* 공개범위 */}
        <div className="space-y-2">
          <div className="bg-background-gray text-text-sub2 font-label-normal flex w-fit items-center gap-2 rounded-lg px-3 py-2">
            <Image
              src="/studynotes/lock.svg"
              alt="lock"
              width={14}
              height={14}
            />
            <span>공개범위</span>
          </div>
          <div className="text-text-main font-body2-normal">
            {visibilityText}
          </div>
        </div>

        {/* 수업대상 */}
        {studentInfos.length > 0 && (
          <div className="space-y-2">
            <div className="bg-background-gray text-text-sub2 font-label-normal flex w-fit items-center gap-2 rounded-lg px-3 py-2">
              <Image
                src="/studynotes/person.svg"
                alt="person"
                width={14}
                height={14}
              />
              <span>수업대상</span>
            </div>
            <div className="text-text-main font-body2-normal space-y-1">
              {studentInfos.map((student, index) => (
                <span key={student.studentId}>
                  {student.studentName}
                  {index < studentInfos.length - 1 && ' '}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </ColumnLayout.Left>
  );
};

export default StudyNoteDetailMetaSection;
