import Image from 'next/image';

import { SessionContainer } from '@/features/home/ui/session-container';

// Session2: 시간 관리
export function Session2() {
  return (
    <SessionContainer
      tag="시간 관리"
      title={
        <>
          여기저기 흩어진 수업 기록,{' '}
          <br
            className="tablet:hidden"
            aria-hidden
          />
          이제 찾지 마세요
        </>
      }
      description={
        <>
          수업 대화와 자료를 한 곳에 쌓여 자료{' '}
          <br
            className="tablet:hidden"
            aria-hidden
          />
          관리에 쓰는 시간을 줄일 수 있어요
        </>
      }
    >
      <Image
        src="/home/im_card_1_mobile.png"
        width={324}
        height={342}
        alt="수업 기록 관리 화면"
        className="tablet:hidden"
      />
      <Image
        src="/home/im_card_1_desktop.png"
        width={1344}
        height={800}
        alt="수업 기록 관리 화면"
        className="max-tablet:hidden"
      />
    </SessionContainer>
  );
}
