import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';

// Session5: 가치 제안
export function Session5() {
  return (
    <section className="from-system-background to-orange-scale-orange-5 flex flex-col gap-6 bg-gradient-to-r px-4.5 py-8">
      <Image
        src="/home/im_intro_2.png"
        width={150}
        height={150}
        alt=""
        className="self-end"
      />
      <div>
        <h2 className="font-headline2-heading mb-2">
          쌓인 기록은 곧
          <br />
          선생님의 자산이 돼요
        </h2>
        <p className="text-gray-90 font-label-normal">
          정리해둔 수업 자료가 시간이 지나 선생님의
          <br />
          강점이 되는 그날까지
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
