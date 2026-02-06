import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';

// Session5: 가치 제안
export function Session5() {
  return (
    <section
      className={cn(
        'from-system-background to-orange-scale-orange-5 flex flex-col gap-6 bg-gradient-to-r px-4.5 py-8',
        'tablet:px-20 tablet:py-12'
      )}
    >
      <div
        className={cn(
          'flex flex-row-reverse justify-between',
          'max-tablet:contents'
        )}
      >
        <Image
          src="/home/im_intro_2.png"
          width={400}
          height={400}
          alt=""
          className={cn('aspect-auto w-37.5 self-end', 'tablet:w-50')}
        />
        <div>
          <h2
            className={cn(
              'font-headline2-heading mb-2',
              'tablet:font-title-heading'
            )}
          >
            쌓인 기록은 곧
            <br />
            선생님의 자산이 돼요
          </h2>
          <p
            className={cn(
              'text-gray-90 font-label-normal',
              'tablet:font-body1-normal'
            )}
          >
            정리해둔 수업 자료가 시간이 지나 선생님의
            <br />
            강점이 되는 그날까지
          </p>
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className={cn('grid grid-cols-2 gap-2', 'tablet:flex')}>
        <Button
          variant="secondary"
          size="xsmall"
          asChild
          className={cn('tablet:h-13.5', 'tablet:px-12')}
        >
          <Link href="/list/teachers">등록된 선생님 보러가기</Link>
        </Button>
        <Button
          size="xsmall"
          asChild
          className={cn('tablet:h-13.5', 'tablet:px-12')}
        >
          <Link href={PUBLIC.CORE.SIGNUP}>디에듀 시작하기</Link>
        </Button>
      </div>
    </section>
  );
}
