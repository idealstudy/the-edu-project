'use client';

import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

import { ProfileForm } from '@/features/auth/components/profile-form';
import { SocialRegisterForm } from '@/features/auth/schemas/social-register';
import { useUpdateProfile } from '@/features/auth/services/query';
import { Form } from '@/shared/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';

export const SocialSelectRole = () => {
  const router = useRouter();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<SocialRegisterForm>({
    resolver: zodResolver(SocialRegisterForm),
    mode: 'onChange',
    defaultValues: {
      role: 'ROLE_TEACHER',
      name: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    updateProfile(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
      onError: () => {
        alert('프로필 완성에 실패했습니다. 다시 시도해주세요.');
      },
    });
  });

  return (
    <Form onSubmit={handleSubmit}>
      <ProfileForm
        form={form}
        buttonText={isPending ? '처리 중...' : '프로필 완성'}
      />
    </Form>
  );
};
