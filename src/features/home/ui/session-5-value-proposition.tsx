import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { cn } from '@/shared/lib';

// Session5: 가치 제안
export function Session5() {
  return (
    <section className="from-system-background to-orange-scale-orange-5 bg-gradient-to-r">
      <div
        className={cn(
          'mx-auto my-8 flex w-81 flex-col gap-6',
          'tablet:my-12 tablet:w-152',
          'desktop:my-20 desktop:w-228 desktop:gap-0'
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
            className={cn(
              'aspect-auto w-37.5 self-end',
              'tablet:w-50',
              'desktop:w-75'
            )}
          />
          <div>
            <h2
              className={cn(
                'font-headline2-heading mb-2',
                'tablet:font-title-heading',
                'desktop:font-display-1'
              )}
            >
              쌓인 기록은 곧
              <br />
              선생님의 자산이 돼요
            </h2>
            <p
              className={cn(
                'text-gray-11 font-label-normal',
                'tablet:font-body1-normal',
                'desktop:font-title-normal'
              )}
            >
              정리해둔 수업 자료가 시간이 지나{' '}
              <br className="max-desktop:hidden" /> 선생님의{' '}
              <br className="desktop:hidden" />
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
            className={cn(
              'font-label-normal',
              'tablet:h-13.5 tablet:px-12 tablet:font-body2-normal'
            )}
          >
            <Link href={PUBLIC.CORE.LIST.TEACHERS}>등록된 선생님 보러가기</Link>
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
      </div>
    </section>
  );
}
