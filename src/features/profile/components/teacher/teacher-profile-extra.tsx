import { useFormContext } from 'react-hook-form';

import Image from 'next/image';

import { ProfileUpdateForm } from '@/features/profile/schema/schema';
import { Form, Input } from '@/shared/components/ui';

interface TeacherProfileExtraProps {
  teacherNoteCount: number;
  studentCount: number;
  reviewCount: number;
  description: string;
  isEditMode: boolean;
}

export default function TeacherProfileExtra({
  teacherNoteCount,
  studentCount,
  reviewCount,
  description,
  isEditMode,
}: TeacherProfileExtraProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileUpdateForm>();

  return (
    <>
      <div className="flex justify-between">
        <div className="flex flex-col items-center">
          <Image
            src="/profile/ic_studynote.svg"
            width={24}
            height={24}
            alt="누적 수업노트"
          />
          <span className="text-text-sub2 font-label-normal mt-1">
            누적 수업노트
          </span>
          <span className="font-headline2-heading text-key-color-primary">
            {teacherNoteCount.toLocaleString()}개
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/profile/ic_person.svg"
            width={24}
            height={24}
            alt="누적 학생"
          />
          <span className="text-text-sub2 font-label-normal mt-1">
            누적 학생
          </span>
          <span className="font-headline2-heading text-key-color-primary">
            {studentCount.toLocaleString()}명
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/profile/ic_review.svg"
            width={24}
            height={24}
            alt="누적 후기"
          />
          <span className="text-text-sub2 font-label-normal mt-1">
            누적 후기
          </span>
          <span className="font-headline2-heading text-key-color-primary">
            {reviewCount.toLocaleString()}개
          </span>
        </div>
      </div>

      <div>
        <h4 className="font-body1-heading mb-2">간단 소개</h4>

        {isEditMode ? (
          <Form.Item error={!!errors.desc}>
            <Form.Control>
              <Input
                {...register('desc')}
                placeholder="간단 소개를 입력해 주세요."
              />
            </Form.Control>
            {errors.desc?.message && (
              <Form.ErrorMessage>{errors.desc.message}</Form.ErrorMessage>
            )}
          </Form.Item>
        ) : (
          <p>{description}</p>
        )}
      </div>
    </>
  );
}
