'use client';

import { useForm } from 'react-hook-form';

import { ProfileForm } from '@/features/auth/components/profile-form';
import { SocialRegisterForm } from '@/features/auth/schemas/social-register';
import { Form } from '@/shared/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';

export const SocialSelectRole = () => {
  const form = useForm<SocialRegisterForm>({
    resolver: zodResolver(SocialRegisterForm),
    mode: 'onChange',
    defaultValues: {
      role: 'ROLE_TEACHER',
      name: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (/* data */) => {
    // TODO 프로필 완성 API 호출
  });

  return (
    <Form onSubmit={handleSubmit}>
      <ProfileForm
        form={form}
        buttonText="프로필 완성"
      />
    </Form>
  );
};
