import Link from 'next/link';

import { MENTOR_PROFILE } from '@/features/teachers/mentor-profile';
import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';

/**
 * 홈 히어로 (`heroView`) — frd-public-portal-v1 §4.1.
 * 게스트 최상단 모듈. 포지셔닝 + 잠금팩트 3종(하드 팩트, `예시` 라벨
 * 없음) + CTA 2개("오늘의 문제 풀기" / "고민 상담 신청"). 백엔드 장애와
 * 무관하게 항상 뜨는 정적 상수 조합이라 서버 컴포넌트로 유지한다.
 */
export function PortalHero() {
  return (
    <section className="bg-system-background w-full">
      <div className="mx-auto w-full max-w-360 px-4 py-12 md:px-8 lg:px-20 lg:py-16">
        <p className="font-label-normal text-key-color-primary mb-3">
          디에듀 상담소
        </p>
        <h1 className="font-title-heading max-w-180 text-3xl leading-[135%] tracking-tight lg:text-4xl">
          문제 하나로 시작해서, 등급을 관리해드립니다
        </h1>
        <p className="font-body1-normal text-text-sub2 mt-4 max-w-140">
          오늘의 문제로 지금 실력을 확인하거나, 고민을 비공개로 남기면
          {MENTOR_PROFILE.name} 선생님이 직접 확인합니다.
        </p>

        <div className="mt-6 flex flex-wrap gap-8">
          {MENTOR_PROFILE.facts.map((fact) => (
            <div key={fact.label}>
              <p className="font-headline1-heading text-key-color-primary">
                {fact.value}
              </p>
              <p className="font-label-normal text-text-sub2">{fact.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="large"
          >
            <Link href="#today-challenge">오늘의 문제 즉시 풀기</Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="large"
          >
            <Link href={PUBLIC.CONSULT.INDEX}>고민 비공개로 상담 신청</Link>
          </Button>
        </div>

        <p className="font-label-normal text-text-sub2 mt-4">
          경력·상담·배출 수치는 실제 값입니다 (그 외 진도·통과율은 예시)
        </p>
      </div>
    </section>
  );
}
