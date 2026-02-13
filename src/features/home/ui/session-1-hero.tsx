import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';

// Session1: 히어로
export function Session1() {
  return (
    <section
      className={cn(
        'mx-auto flex flex-col items-center gap-3 px-4.5 py-8',
        'tablet:w-[608] tablet:p-0 tablet:items-start tablet:gap-10 tablet:my-12',
        'desktop:w-[912] desktop:my-20 desktop:gap-8'
      )}
    >
      <Image
        src="/home/im_intro_1.png"
        width={200}
        height={200}
        alt=""
        className="tablet:hidden"
      />

      <div className={cn('flex w-full justify-between', 'max-tablet:contents')}>
        <div
          className={cn(
            'flex flex-col items-center gap-2',
            'tablet:gap-6 tablet:items-start',
            'desktop:gap-8'
          )}
        >
          <span
            className={cn(
              'font-body2-heading text-orange-7',
              'tablet:font-headline2-heading'
            )}
          >
            디에듀
          </span>
          <h1
            className={cn(
              'font-headline1-heading text-center',
              'tablet:font-title-heading tablet:text-left',
              'desktop:font-display-1'
            )}
          >
            수업 기록부터 <br className="max-desktop:hidden" />
            학생 관리까지 <br className="desktop:hidden" />한 곳에서
          </h1>
          <p
            className={cn(
              'font-label-normal text-gray-11 text-center',
              'tablet:text-start tablet:font-body1-normal',
              'desktop:font-title-normal'
            )}
          >
            수업 기록, 학생 숙제와 질문 관리가 하나로
            <br />
            연결되는 경험을 만들어갑니다
          </p>
        </div>

        <Image
          src="/home/im_intro_1.png"
          width={300}
          height={300}
          alt=""
          className={cn(
            'aspect-square w-50',
            'max-tablet:hidden',
            'desktop:w-75'
          )}
        />
      </div>

      {/* CTA 버튼 */}
      <div className={cn('grid grid-cols-2 gap-2', 'tablet:flex')}>
        <Button
          variant="secondary"
          size="xsmall"
          asChild
          className={cn(
            'font-label-normal',
            'tablet:h-13.5 tablet:px-12 tablet:font-body2-normal'
          )}
        >
          <Link href="/list/teachers">등록된 선생님 보러가기</Link>
        </Button>
        <Button
          size="xsmall"
          asChild
          className={cn(
            'font-label-heading',
            'tablet:h-13.5 tablet:px-12 tablet:font-body2-heading'
          )}
        >
          <Link href={PUBLIC.CORE.SIGNUP}>디에듀 시작하기</Link>
        </Button>
      </div>
    </section>
  );
}
