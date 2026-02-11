'use client';

import { Dispatch, SetStateAction } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Image from 'next/image';

import {
  FrontendBasicInfo,
  UpdateBasicInfoPayload,
} from '@/entities/teacher/types';
import { useUpdateTeacherBasicInfo } from '@/features/mypage/hooks/teacher/use-basic-info';
import {
  BasicInfoForm,
  BasicInfoFormSchema,
} from '@/features/mypage/schema/schema';
import {
  Button,
  Form,
  Input,
  RequiredMark,
  Select,
} from '@/shared/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';

interface EditProfileCardProps {
  basicInfo: FrontendBasicInfo;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
}

export default function EditProfileCard({
  basicInfo,
  setIsEditMode,
}: EditProfileCardProps) {
  const isTeacher = basicInfo.role === 'ROLE_TEACHER';

  // TODO API 연결 수정 예정
  const updateTeacherBasicInfoMutation = useUpdateTeacherBasicInfo();

  const updateProfileMutation = isTeacher
    ? updateTeacherBasicInfoMutation
    : // TODO 학생으로 변경
      updateTeacherBasicInfoMutation;

  const {
    register,
    handleSubmit,
    // setError,
    reset,
    control,
    formState: { errors /* isSubmitting */ },
  } = useForm<BasicInfoForm>({
    resolver: zodResolver(BasicInfoFormSchema),
    defaultValues: {
      name: basicInfo.name,
      isProfilePublic: basicInfo.isProfilePublic,
      simpleIntroduction:
        basicInfo.role === 'ROLE_TEACHER'
          ? (basicInfo.simpleIntroduction ?? '')
          : '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: UpdateBasicInfoPayload) => {
    await updateProfileMutation.mutateAsync(data);

    setIsEditMode(false);
  };

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8"
    >
      <div>
        <Form.Item error={!!errors.name}>
          <Form.Label>
            이름
            <RequiredMark />
          </Form.Label>

          <Form.Control>
            <Input
              {...register('name')}
              placeholder="이름를 입력해 주세요."
            />
          </Form.Control>
          {errors.name?.message && (
            <Form.ErrorMessage>{errors.name.message}</Form.ErrorMessage>
          )}
        </Form.Item>
      </div>

      <Image
        src={'/character/img_signup_type01.png'}
        width={280}
        height={280}
        alt={`${basicInfo.name}님의 프로필 이미지`}
        className="aspect-square self-center rounded-full border border-gray-400 object-cover"
      />

      <Form.Item error={!!errors.isProfilePublic}>
        <Form.Label>
          공개 범위
          <RequiredMark />
        </Form.Label>

        <Controller
          name="isProfilePublic"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ? 'public' : 'private'}
              onValueChange={(v) => field.onChange(v === 'public')}
            >
              <Select.Trigger />

              <Select.Content>
                <Select.Option value="public">공개</Select.Option>
                <Select.Option value="private">비공개</Select.Option>
              </Select.Content>
            </Select>
          )}
        />
      </Form.Item>

      <Form.Item error={!!errors.simpleIntroduction}>
        <Form.Label>간단 소개</Form.Label>

        <Form.Control>
          <Input
            {...register('simpleIntroduction')}
            placeholder="간단 소개를 입력해 주세요."
          />
        </Form.Control>
        {errors.simpleIntroduction?.message && (
          <Form.ErrorMessage>
            {errors.simpleIntroduction.message}
          </Form.ErrorMessage>
        )}
      </Form.Item>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={() => {
            reset();
            setIsEditMode(false);
          }}
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="secondary"
          size="small"
          disabled={updateProfileMutation.isPending}
        >
          저장
        </Button>
      </div>
    </Form>
  );
}
