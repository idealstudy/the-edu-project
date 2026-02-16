import Image from 'next/image';

import { SessionContainer } from '@/features/home/ui/session-container';

// Session4: 학생 관리
export function Session4() {
  return (
    <SessionContainer
      tag="학생 관리"
      title={
        <>
          과제 관리와 학생 질문도{' '}
          <br
            className="tablet:hidden"
            aria-hidden
          />
          한번에 관리해요
        </>
      }
      description={
        <>
          과제 제출부터 질문 확인까지, 수업 이후의{' '}
          <br
            className="tablet:hidden"
            aria-hidden
          />
          학생 관리 시간을 줄여보세요
        </>
      }
    >
      <Image
        src="/home/im_card_3_mobile.png"
        width={324}
        height={342}
        alt="대시보드 화면"
        className="tablet:hidden"
      />
      <Image
        src="/home/im_card_3_desktop.png"
        width={1344}
        height={800}
        alt="온보딩 화면"
        className="max-tablet:hidden"
      />
    </SessionContainer>
  );
}
