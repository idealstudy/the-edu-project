import Image from 'next/image';

import { SessionContainer } from '@/features/home/ui/session-container';

// Session3: 수업 관리
export function Session3() {
  return (
    <SessionContainer
      tag="수업 관리"
      title={
        <>
          정리된 기록으로 따라가기 쉬운
          <br />
          수업을 만들어보세요
        </>
      }
      description={
        <>
          수업 내용과 자료가 흩어지지 않아 학생들의
          <br />
          예습과 복습이 간편해져요
        </>
      }
    >
      <div className="space-y-3">
        <Image
          src="/home/im_card_2_mobile.png"
          width={324}
          height={342}
          alt="스터디룸 화면"
        />
        <div className="bg-background-orange h-31 w-full rounded-lg bg-[url('/home/im_review_1.png')] bg-[length:100px_100px] bg-[position:right_6px_bottom] bg-no-repeat">
          <div className="space-y-3 px-5 pt-5.5">
            <p className="font-body2-heading">
              디에듀에 잘 정리해놓으면
              <br />
              아이들이 찾아보기 쉬운 거 같아요
            </p>
            <span className="font-caption-heading text-text-sub2">
              박O혁 선생님
            </span>
          </div>
        </div>

        <div className="bg-background-orange h-31 w-full rounded-lg bg-[url('/home/im_review_2.png')] bg-[length:100px_100px] bg-[position:right_6px_bottom] bg-no-repeat">
          <div className="space-y-3 px-5 pt-5.5">
            <p className="font-body2-heading">
              수업 내용이 한 곳에 모여
              <br />
              있으니 복습하기 좋아요
            </p>
            <span className="font-caption-heading text-text-sub2">
              김O연 선생님
            </span>
          </div>
        </div>
      </div>
    </SessionContainer>
  );
}
