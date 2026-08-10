import Link from 'next/link';

import { MENTOR_PROFILE } from '@/features/teachers/mentor-profile';
import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';

/** 홈 "대표 멘토" 모듈 — frd-public-portal-v1 §4.1 모듈 순서 5번째. */
export function PortalMentorTeaser() {
  return (
    <section className="mx-auto w-full max-w-360 px-4 py-10 md:px-8 lg:px-20">
      <h2 className="font-headline2-heading mb-6">대표 멘토</h2>
      <div className="border-line-line1 flex flex-col items-center justify-between gap-6 rounded-xl border bg-white p-6 text-center md:flex-row md:text-left">
        <div>
          <p className="font-body1-heading">{MENTOR_PROFILE.name} 선생님</p>
          <p className="font-body2-normal text-text-sub2 mt-1">
            {MENTOR_PROFILE.facts
              .map((f) => `${f.value} ${f.label}`)
              .join(' · ')}
          </p>
        </div>
        <Button
          asChild
          variant="outlined"
        >
          <Link href={PUBLIC.TEACHERS.DETAIL}>프로필 자세히 보기</Link>
        </Button>
      </div>
    </section>
  );
}
