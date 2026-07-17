import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';

/** 홈 "상담소" 배너 모듈 — frd-public-portal-v1 §4.1 모듈 순서 4번째. */
export function PortalConsultCta() {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-8 lg:px-20">
      <div className="bg-key-color-primary flex flex-col items-center gap-4 rounded-xl px-6 py-10 text-center text-white md:flex-row md:justify-between md:text-left">
        <div>
          <p className="font-headline2-heading">
            혼자 판단하지 말고 물어보세요
          </p>
          <p className="font-body2-normal mt-1 text-white/85">
            질문은 비공개로 접수하고, 동의받은 답변만 익명 사례로
            공개합니다.
          </p>
        </div>
        <Button
          asChild
          variant="secondary"
          size="large"
          className="bg-white"
        >
          <Link href={PUBLIC.CONSULT.INDEX}>비공개 상담 신청</Link>
        </Button>
      </div>
    </section>
  );
}
