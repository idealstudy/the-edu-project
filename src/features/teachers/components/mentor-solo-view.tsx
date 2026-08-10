import Image from 'next/image';
import Link from 'next/link';

import { MENTOR_PROFILE } from '@/features/teachers/mentor-profile';
import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';

/**
 * 대표 멘토 단독 프로필 (`mentorSoloView`) — frd-public-portal-v1 §4.4.
 * 초상은 7/19 실사진 이월 전까지 `data-asset-slot`으로 자리만 확보한다
 * (§2 "실사진 7/19 이월. data-asset-slot 마커로 자리만 확보 — 빌드
 * 블로킹 아님").
 */
export function MentorSoloView() {
  return (
    <div className="mx-auto w-full max-w-240 px-4 py-10 md:px-8">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:gap-10 md:text-left">
        <div
          data-asset-slot="mentor-real-photo"
          className="border-line-line1 relative h-49 w-42 shrink-0 overflow-hidden rounded-xl border bg-gradient-to-b from-[#FCFBFA] to-[#FFE7E2]"
        >
          <Image
            src="/character/img_coming_soon01.png"
            alt={`${MENTOR_PROFILE.name} 선생님 프로필 (실사진 준비 중)`}
            fill
            className="object-contain p-4"
          />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="font-label-normal text-key-color-primary">
              {MENTOR_PROFILE.title}
            </p>
            <h1 className="font-title-heading mt-1 text-2xl lg:text-3xl">
              {MENTOR_PROFILE.name} 선생님
            </h1>
          </div>

          <div className="flex justify-center gap-8 md:justify-start">
            {MENTOR_PROFILE.facts.map((fact) => (
              <div key={fact.label}>
                <p className="font-headline1-heading text-key-color-primary">
                  {fact.value}
                </p>
                <p className="font-label-normal text-text-sub2">{fact.label}</p>
              </div>
            ))}
          </div>

          <Button
            asChild
            size="large"
            className="w-full md:w-fit"
          >
            <Link href={PUBLIC.CONSULT.INDEX}>조성진 선생님께 상담 신청</Link>
          </Button>
          <p className="font-label-normal text-text-sub2">
            상담 신청만으로는 어떤 권한도 생기지 않아요 — 그냥 선생님을 찾는
            학생·학부모로 남습니다.
          </p>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="font-headline2-heading mb-6">선별 기준 3가지</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {MENTOR_PROFILE.criteria.map((item) => (
            <div
              key={item.title}
              className="border-line-line1 rounded-xl border bg-white p-6"
            >
              <p className="font-body1-heading mb-2">{item.title}</p>
              <p className="font-body2-normal text-text-sub2">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-line-line1 mt-10 rounded-xl border bg-white p-6">
        <p className="font-body1-heading mb-2">왜 한 명만 있나요?</p>
        <p className="font-body2-normal text-text-sub2">
          {MENTOR_PROFILE.whySoloNote}
        </p>
      </section>

      <div className="mt-10 text-center">
        <Button
          asChild
          variant="outlined"
          size="medium"
        >
          <Link href={PUBLIC.COURSE.LIST}>조성진 선생님의 코스 보기</Link>
        </Button>
      </div>
    </div>
  );
}
