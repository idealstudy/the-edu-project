import Image from 'next/image';

import { SessionContainer } from '@/features/home/ui/session-container';
import { cn } from '@/shared/lib';

// Session3: 수업 관리
export function Session3() {
  return (
    <SessionContainer
      tag="수업 관리"
      title={
        <>
          정리된 기록으로 따라가기 쉬운{' '}
          <br
            className="tablet:hidden"
            aria-hidden
          />
          수업을 만들어보세요
        </>
      }
      description={
        <>
          수업 내용과 자료가 흩어지지 않아 학생들의{' '}
          <br
            className="tablet:hidden"
            aria-hidden
          />
          예습과 복습이 간편해져요
        </>
      }
    >
      <div
        className={cn(
          'flex w-full flex-col gap-3',
          'tablet:gap-5 tablet:flex-row'
        )}
      >
        <Image
          src="/home/im_card_2_mobile.png"
          width={324}
          height={342}
          alt="스터디룸 화면"
          className="tablet:hidden"
        />

        <div
          className={cn('grid flex-1 grid-cols-1 gap-5', 'max-tablet:contents')}
        >
          {/* 후기 1 */}
          <div
            className={cn(
              "bg-background-orange h-31 w-full rounded-lg bg-[url('/character/img_profile_student02.png')] bg-[length:100px_100px] bg-[position:right_6px_bottom] bg-no-repeat",
              'tablet:h-full',
              'desktop:bg-[length:150px_150px]'
            )}
          >
            <div className={cn('space-y-3 px-5 pt-5.5')}>
              <p
                className={cn(
                  'font-body2-heading text-nowrap',
                  'desktop:font-headline1-heading'
                )}
              >
                디에듀에 잘 정리해놓으면
                <br />
                아이들이 찾아보기 쉬운 거 같아요
              </p>
              <span
                className={cn(
                  'font-caption-heading text-text-sub2',
                  'desktop:font-body1-normal'
                )}
              >
                박O혁 선생님
              </span>
            </div>
          </div>
          {/* 후기 2 */}
          <div
            className={cn(
              "bg-background-orange h-31 w-full rounded-lg bg-[url('/character/img_profile_teacher02.png')] bg-[length:100px_100px] bg-[position:right_6px_bottom] bg-no-repeat",
              'tablet:h-full',
              'desktop:bg-[length:150px_150px]'
            )}
          >
            <div className="space-y-3 px-5 pt-5.5">
              <p
                className={cn(
                  'font-body2-heading text-nowrap',
                  'desktop:font-headline1-heading'
                )}
              >
                수업 내용이 한 곳에 모여
                <br />
                있으니 복습하기 좋아요
              </p>
              <span
                className={cn(
                  'font-caption-heading text-text-sub2',
                  'desktop:font-body1-normal'
                )}
              >
                김O연 선생님
              </span>
            </div>
          </div>
        </div>

        <Image
          src="/home/im_card_2_desktop.png"
          width={517}
          height={543}
          alt="스터디룸 화면"
          className={cn(
            'max-tablet:hidden',
            'tablet:w-86',
            'desktop:w-[517px]'
          )}
        />
      </div>
    </SessionContainer>
  );
}
