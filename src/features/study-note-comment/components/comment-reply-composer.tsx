'use client';

import Image from 'next/image';

import { TextEditor } from '@/shared/components/editor';
import { Button } from '@/shared/components/ui';
import { useRole } from '@/shared/hooks';
import { JSONContent } from '@tiptap/react';

interface CommentReplyComposerProps {
  value: JSONContent;
  isSubmitDisabled: boolean;
  onChange: (value: JSONContent) => void;
  onCancel: () => void;
}

export const CommentReplyComposer = ({
  value,
  isSubmitDisabled,
  onChange,
  onCancel,
}: CommentReplyComposerProps) => {
  const { role } = useRole();

  return (
    <section>
      <div className="flex items-start gap-3">
        <Image
          src="/studynotes/teacher_answer.png"
          alt="답변"
          width={32}
          height={32}
          className="mt-4 shrink-0"
        />
        <div className="border-gray-3 w-full rounded-sm border bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="border-gray-12 h-9 w-9 shrink-0 overflow-hidden rounded-full border">
                <Image
                  src={
                    role === 'ROLE_STUDENT'
                      ? `/character/img_profile_student01.png`
                      : `/character/img_profile_teacher01.png`
                  }
                  alt="프로필 이미지"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              </div>
              {role === 'ROLE_STUDENT' ? (
                <>
                  <p className="font-body2-normal text-gray-12">이름</p>
                  <p className="text-gray-7">·</p>
                  <p className="font-body2-normal text-gray-7">학생</p>
                </>
              ) : (
                <p className="font-body2-normal text-gray-12">선생님</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="outlined"
                onClick={onCancel}
                className="font-label-normal disabled:font-label-normal h-[35px] shrink-0 px-6 py-2"
              >
                취소
              </Button>
              <Button
                disabled={isSubmitDisabled}
                className="font-label-normal disabled:font-label-normal h-[35px] shrink-0 px-6 py-2"
              >
                답장 남기기
              </Button>
            </div>
          </div>

          <div className="mt-3">
            <TextEditor
              value={value}
              onChange={onChange}
              placeholder="답장 내용을 입력해 주세요."
              targetType="TEACHING_NOTE"
              minHeight="120px"
              maxHeight="240px"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
