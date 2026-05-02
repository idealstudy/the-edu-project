'use client';

import { Dispatch, SetStateAction } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { UserBasicInfo } from '@/entities/member/types';
import EditProfileImageField from '@/features/mypage/common/components/edit-profile-image-field';
import { useUpdateStudentBasicInfo } from '@/features/mypage/common/hooks/student/use-basic-info';
import { useUpdateTeacherBasicInfo } from '@/features/mypage/common/hooks/teacher/use-basic-info';
import { useEditProfileImage } from '@/features/mypage/common/hooks/use-edit-profile-image';
import {
  BasicInfoForm,
  BasicInfoFormSchema,
} from '@/features/mypage/common/schema/schema';
import { ProfileChangeModal } from '@/features/profile-image/components/profile_change_modal';
import {
  useProfileImage,
  // useUpdateProfileImage,
} from '@/features/profile-image/hooks/use-profile-image';
import { useImageUpload } from '@/shared/components/editor';
import { ImageCropper } from '@/shared/components/image-crop';
import {
  Button,
  Form,
  Input,
  RequiredMark,
  Select,
  Textarea,
} from '@/shared/components/ui';
import { classifyMypageError, handleApiError } from '@/shared/lib/errors';
import { zodResolver } from '@hookform/resolvers/zod';

interface EditProfileCardProps {
  basicInfo: UserBasicInfo;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
}

export default function EditProfileCard({
  basicInfo,
  setIsEditMode,
}: EditProfileCardProps) {
  const router = useRouter();

  // TODO Parent API 추가
  const updateTeacherBasicInfoMutation = useUpdateTeacherBasicInfo();
  const updateStudentBasicInfoMutation = useUpdateStudentBasicInfo();

  const { data: profileImageData } = useProfileImage();
  // const { mutateAsync: updateImage } = useUpdateProfileImage();
  // TODO : uploadAsync 추가
  const { isUploading } = useImageUpload();
  const profileImage = useEditProfileImage({
    serverImageUrl: profileImageData?.imageUrl,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<BasicInfoForm>({
    resolver: zodResolver(BasicInfoFormSchema),
    defaultValues: {
      name: basicInfo.name,
      isProfilePublic: basicInfo.isProfilePublic,
      simpleIntroduction:
        basicInfo.role === 'ROLE_TEACHER'
          ? basicInfo.simpleIntroduction
          : undefined,
      learningGoal:
        basicInfo.role === 'ROLE_STUDENT'
          ? basicInfo.learningGoal || ''
          : undefined,
    },
    mode: 'onChange',
  });

  const onSubmit = (data: BasicInfoForm) => {
    if (basicInfo.role === 'ROLE_TEACHER') {
      updateTeacherBasicInfoMutation.mutate(
        {
          name: data.name,
          isProfilePublic: data.isProfilePublic,
          simpleIntroduction: data.simpleIntroduction ?? '',
        },
        {
          onSuccess: () => {
            setIsEditMode(false);
          },
          onError: (error) => {
            handleApiError(error, classifyMypageError, {
              onAuth: () => {
                // MEMBER_NOT_EXIST
                setTimeout(() => {
                  router.replace('/login');
                }, 1500);
              },
              onUnknown: () => {},
            });
          },
        }
      );
    } else if (basicInfo.role === 'ROLE_STUDENT') {
      updateStudentBasicInfoMutation.mutate(
        {
          name: data.name,
          isProfilePublic: data.isProfilePublic,
          learningGoal: data.learningGoal ?? '',
        },
        {
          onSuccess: () => {
            setIsEditMode(false);
          },
          onError: (error) => {
            handleApiError(error, classifyMypageError, {
              onAuth: () => {
                // MEMBER_NOT_EXIST
                setTimeout(() => {
                  router.replace('/login');
                }, 1500);
              },
              onUnknown: () => {},
            });
          },
        }
      );
    }
  };

  return (
    <>
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
                placeholder="이름을 입력해 주세요."
              />
            </Form.Control>
            {errors.name?.message && (
              <Form.ErrorMessage>{errors.name.message}</Form.ErrorMessage>
            )}
          </Form.Item>
        </div>

        <EditProfileImageField
          fileInputRef={profileImage.fileInputRef}
          isUploading={isUploading}
          name={basicInfo.name}
          onFileChange={profileImage.handleProfileImageChange}
          onOpenModal={() => profileImage.setOpenModal(true)}
          profileImageUrl={profileImage.profileImageUrl}
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
        {basicInfo.role === 'ROLE_TEACHER' && (
          <Form.Item error={!!errors.simpleIntroduction}>
            <Form.Label>간단 소개</Form.Label>

            <Form.Control>
              <Textarea
                {...register('simpleIntroduction')}
                placeholder="간단한 소개와 연락처를 남겨보세요!"
                className="resize-none"
              />
            </Form.Control>
            {errors.simpleIntroduction?.message && (
              <Form.ErrorMessage>
                {errors.simpleIntroduction.message}
              </Form.ErrorMessage>
            )}
          </Form.Item>
        )}
        {basicInfo.role === 'ROLE_STUDENT' && (
          <Form.Item error={!!errors.learningGoal}>
            <Form.Label>학습 목표</Form.Label>

            <Form.Control>
              <Input
                {...register('learningGoal')}
                placeholder="학습 목표를 입력해 주세요."
              />
            </Form.Control>
            {errors.learningGoal?.message && (
              <Form.ErrorMessage>
                {errors.learningGoal.message}
              </Form.ErrorMessage>
            )}
          </Form.Item>
        )}
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
          {/* TODO 저장버튼 누를시 프로필 이미지도 전송 */}
          <Button
            type="submit"
            variant="secondary"
            size="small"
            disabled={isSubmitting || !isDirty || !isValid}
          >
            저장
          </Button>
        </div>
      </Form>
      {profileImage.openModal && (
        <ProfileChangeModal
          isOpen={profileImage.openModal}
          onOpenChange={profileImage.setOpenModal}
          handleOpenFilePicker={profileImage.handleOpenFilePicker}
          setImageUrl={profileImage.setImageUrl}
          selectedImageId={profileImage.selectedImageId}
          setSelectedImageId={profileImage.setSelectedImageId}
          clearSelectedImage={profileImage.clearSelectedImage}
          handleImageCropper={profileImage.handleImageCropper}
        />
      )}
      <ImageCropper
        isOpen={profileImage.isCropperClicked}
        onOpenChange={profileImage.setIsCropperClicked}
        onApply={profileImage.onApply}
        image={profileImage.imageUrl}
        crop={profileImage.crop}
        zoom={profileImage.zoom}
        aspect={1}
        onCropChange={profileImage.setCrop}
        onZoomChange={profileImage.setZoom}
        onCropComplete={(_, croppedAreaPixels) => {
          profileImage.setCroppedAreaPixels(croppedAreaPixels);
        }}
        clearSelectedImage={profileImage.clearSelectedImage}
      />
    </>
  );
}
