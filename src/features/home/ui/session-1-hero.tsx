import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';

// Session1: 히어로
export function Session1() {
  return (
    <section className="flex flex-col items-center gap-3 px-4.5 py-8">
      <Image
        src="/home/im_intro_1.png"
        width={200}
        height={200}
        alt=""
      />

      <div className="flex flex-col items-center gap-2">
        <span className="font-body2-heading text-key-color-primary">
          디에듀
        </span>
        <h1 className="font-headline1-heading text-center">
          수업 기록부터 학생 관리까지
          <br />한 곳에서
        </h1>
        <p className="font-label-normal text-gray-scale-gray-90 text-center">
          수업 기록, 학생 숙제와 질문 관리가 하나로
          <br />
          연결되는 경험을 만들어갑니다
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="xsmall"
          asChild
        >
          <Link href="/list/teachers">등록된 선생님 보러가기</Link>
        </Button>
        <Button
          size="xsmall"
          asChild
        >
          <Link href={PUBLIC.CORE.SIGNUP}>디에듀 시작하기</Link>
        </Button>
      </div>
    </section>
  );
}
