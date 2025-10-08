'use client';

import React from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';

import { Form } from '@/components/ui/form';
import ProgressIndicator from '@/features/studyrooms/components/create/ProgressIndicator';
import StepOne from '@/features/studyrooms/components/create/StepOne';
import StepThree from '@/features/studyrooms/components/create/StepThree';
import StepTwo from '@/features/studyrooms/components/create/StepTwo';
import { useStepValidate } from '@/features/studyrooms/hooks/useStepValidate';
import {
  StepState,
  createStepState,
  stepperReducer,
} from '@/features/studyrooms/hooks/useStepperReducer';
import {
  CreateStudyRoomSchema,
  StudyRoomFormValues,
} from '@/features/studyrooms/schemas/create';
import { zodResolver } from '@hookform/resolvers/zod';

export const ORDER = ['basic', 'profile', 'invite'] as const;
export type Step = (typeof ORDER)[number];

type FieldName =
  | 'basic.title'
  | 'basic.visibility'
  | 'profile.location'
  | 'profile.classType'
  | 'profile.subject'
  | 'profile.school'
  | 'profile.grade'
  | 'invite.emails';
/**
 * - basic : 스터디룸의 메타데이터
 * - profile : 스터디룸이 어떤 수업을 위한 것인지 설명하는 교육 프로필
 * - invite: 참여자
 **/
export const fieldsPerStep: Record<Step, FieldName[]> = {
  basic: ['basic.title', 'basic.visibility'],
  profile: [
    'profile.classType',
    'profile.location',
    'profile.subject',
    'profile.school',
    'profile.grade',
  ],
  invite: ['invite.emails'],
};

export default function CreateStudyRoomFlow() {
  const [state, dispatch] = React.useReducer(
    stepperReducer,
    createStepState([...ORDER] as Step[])
  );

  const getCurrentStep = (s: StepState) => s.order[s.index];
  const step = getCurrentStep(state)!;

  const methods = useForm<StudyRoomFormValues>({
    mode: 'onChange',
    resolver: zodResolver(CreateStudyRoomSchema),
    shouldUnregister: false,
    defaultValues: {
      basic: {
        title: '',
        visibility: 'public',
      },
      profile: {
        location: undefined,
        classType: undefined,
        subject: undefined,
        school: undefined,
        grade: '',
      },
      invite: {
        emails: '',
      },
    },
  });

  const { isStepValid } = useStepValidate(methods, step);

  const handleNext = async () => {
    const names = fieldsPerStep[step];
    const ok = await methods.trigger(names, { shouldFocus: true });
    if (!ok) return;

    dispatch({ type: 'MARK_VALIDATED', upTo: state.index + 1 });
    dispatch({ type: 'NEXT' });
  };

  const handleIndicatorMove = (to: number) => dispatch({ type: 'GO', to });

  const onSubmit = (data: StudyRoomFormValues) => {
    alert('제출 데이터 : ' + JSON.stringify(data));
    // console.log('values keys:', Object.keys(methods.getValues()));
    // console.log('폼 제출 데이터 :', JSON.stringify(data, null, 2));
  };

  const onError = (errors: FieldErrors<StudyRoomFormValues>) => {
    alert(errors);
    // console.log('제출 실패(errors):', errors);
  };

  return (
    <section className="flex flex-col">
      <div className="mx-auto w-fit">
        <ProgressIndicator
          current={state.index}
          max={state.maxValidatedIndex}
          onMove={handleIndicatorMove}
        />
        <h2 className="mt-8 text-center text-4xl font-semibold">
          스터디룸 만들기
        </h2>
      </div>
      <FormProvider {...methods}>
        <Form
          onSubmit={methods.handleSubmit(onSubmit, onError)}
          className="mt-12"
        >
          {step === 'basic' && (
            <StepOne
              onNext={handleNext}
              disabled={!isStepValid}
            />
          )}
          {step === 'profile' && (
            <StepTwo
              onNext={handleNext}
              disabled={!isStepValid}
            />
          )}
          {step === 'invite' && <StepThree />}
        </Form>
      </FormProvider>
    </section>
  );
}
