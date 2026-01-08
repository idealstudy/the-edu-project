import Image from 'next/image';

import { ProfileData } from '@/features/profile/types';
import { StudyNote } from '@/features/study-notes/model';
import { ListItem } from '@/features/study-rooms/components/common/list-item';
import { getRelativeTimeString } from '@/shared/lib';

type Props = {
  profile: ProfileData;
};

const item: StudyNote = {
  id: 1,
  groupId: null,
  groupName: 'a',
  teacherName: '김에듀 강사',
  title: '수업노트 1',
  visibility: 'PUBLIC',
  taughtAt: '2025-12-27',
  updatedAt: '2025-12-29',
};

export default function StudynotesSection({}: Props) {
  const image = (item: StudyNote) => {
    switch (item.visibility) {
      case 'PUBLIC':
        return (
          <Image
            src="/studynotes/read-global.svg"
            width={28}
            height={28}
            alt="study-notes"
            className="h-[28px] w-[28px] cursor-pointer"
          />
        );
      case 'SPECIFIC_STUDENTS_ONLY':
        return (
          <Image
            src="/studynotes/read-students.svg"
            width={28}
            height={28}
            alt="study-notes"
            className="h-[28px] w-[28px] cursor-pointer"
          />
        );
      case 'SPECIFIC_STUDENTS_AND_PARENTS':
        return (
          <Image
            src="/studynotes/read-students.svg"
            width={28}
            height={28}
            alt="study-notes"
            className="h-[28px] w-[28px] cursor-pointer"
          />
        );
      case 'STUDY_ROOM_STUDENTS_AND_PARENTS':
        return (
          <Image
            src="/studynotes/read-students.svg"
            width={28}
            height={28}
            alt="study-notes"
            className="h-[28px] w-[28px] cursor-pointer"
          />
        );
      case 'TEACHER_ONLY':
        return (
          <Image
            src="/studynotes/read-secret.svg"
            width={28}
            height={28}
            alt="study-notes"
            className="h-[28px] w-[28px] cursor-pointer"
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ListItem
        key={item.id}
        title={item.title}
        tag={
          item.groupId && (
            <p className="text-gray-scale-gray-60 bg-gray-scale-gray-5 flex h-5 items-center justify-center rounded-[4px] p-1 text-[10px]">
              {item.groupName}
            </p>
          )
        }
        icon={image(item)}
        subtitle={
          item.updatedAt === item.taughtAt
            ? `${getRelativeTimeString(item.taughtAt)} 작성`
            : `${getRelativeTimeString(item.updatedAt)} 수정`
        }
        href={`/study-rooms/1/note/${item.id}`}
        id={item.id}
      />
    </>
  );
}
