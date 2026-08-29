'use client';

import Link from 'next/link';

import { Checkbox } from '@/shared/components/ui/checkbox';
import { link } from '@/shared/constants/link';

export const TERMS = [
  { value: 'terms', required: true },
  { value: 'privacy', required: true },
  { value: 'ageCheck', required: true },
  { value: 'marketing', required: false },
] as const;

export type TermValue = (typeof TERMS)[number]['value'];

type TermsAgreementProps = {
  isAllChecked: boolean;
  toggleAll: () => void;
  getCheckboxProps: (value: TermValue) => {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
  };
};

export const TermsAgreement = ({
  isAllChecked,
  toggleAll,
  getCheckboxProps,
}: TermsAgreementProps) => (
  <Checkbox.Group className="border-line-line1 flex flex-col gap-6 border-y py-6">
    <Checkbox.Label className="flex-1">
      <Checkbox
        checked={isAllChecked}
        onCheckedChange={toggleAll}
      />
      전체 약관 동의
    </Checkbox.Label>
    <TermRow
      label="디에듀 이용약관 동의 [필수]"
      href={link.terms}
      linkLabel="이용약관 전문 보기"
      checkboxProps={getCheckboxProps('terms')}
    />
    <TermRow
      label="개인정보 수집 및 이용방침 동의 [필수]"
      href={link.privacy}
      linkLabel="개인정보 수집 및 이용방침 전문 보기"
      checkboxProps={getCheckboxProps('privacy')}
    />
    <TermRow
      label="만 14세 이상입니다 [필수]"
      href={link.ageCheck}
      linkLabel="만 14세 이상 이용 안내 보기"
      checkboxProps={getCheckboxProps('ageCheck')}
    />
    <TermRow
      label="혜택 및 이벤트 정보 수신 동의 [선택]"
      href={link.marketing}
      linkLabel="혜택 및 이벤트 정보 수신 동의 전문 보기"
      checkboxProps={getCheckboxProps('marketing')}
    />
  </Checkbox.Group>
);

const TermRow = ({
  label,
  href,
  linkLabel,
  checkboxProps,
}: {
  label: string;
  href: string;
  linkLabel: string;
  checkboxProps: ReturnType<TermsAgreementProps['getCheckboxProps']>;
}) => (
  <div className="flex items-center">
    <Checkbox.Label className="flex-1">
      <Checkbox {...checkboxProps} />
      {label}
    </Checkbox.Label>
    <Link
      href={href}
      target="_blank"
      aria-label={linkLabel}
      className="text-gray-10 text-lg"
    >
      ›
    </Link>
  </div>
);
