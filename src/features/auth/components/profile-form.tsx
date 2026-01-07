'use client';

import { Controller, Path, UseFormReturn } from 'react-hook-form';

import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import { RoleRadioGroup } from './role-radio-group';

type ProfileFormFields = {
  role: 'ROLE_ADMIN' | 'ROLE_PARENT' | 'ROLE_TEACHER' | 'ROLE_STUDENT';
  name: string;
};

interface ProfileFormProps<T extends ProfileFormFields> {
  form: UseFormReturn<T>;
  buttonText?: string;
}

export const ProfileForm = <T extends ProfileFormFields>({
  form,
  buttonText = '가입 완료',
}: ProfileFormProps<T>) => {
  return (
    <div className="flex flex-col gap-8">
      <Form.Item>
        <Form.Label>사용 유형</Form.Label>
        <Form.Control>
          <Controller
            name={'role' as Path<T>}
            control={form.control}
            render={({ field }) => <RoleRadioGroup {...field} />}
          />
        </Form.Control>
      </Form.Item>
      <Form.Item error={!!form.formState.errors.name}>
        <Form.Label>이름</Form.Label>
        <Form.Control>
          <Input
            placeholder="수업에 사용할 실명"
            {...form.register('name' as Path<T>)}
          />
        </Form.Control>
        <Form.ErrorMessage>
          {form.formState.errors.name?.message as string}
        </Form.ErrorMessage>
      </Form.Item>
      <Button
        size="large"
        type="submit"
      >
        {buttonText}
      </Button>
    </div>
  );
};
