import Image from 'next/image';
import Link from 'next/link';

import { PUBLIC } from '@/shared/constants/route';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#2E2E2E] px-5 py-[68px] text-sm text-white">
      <div className="mx-auto max-w-7xl space-y-4">
        <Link href={PUBLIC.CORE.INDEX}>
          <Image
            src="/logo.svg"
            alt="THE EDU 로고"
            width={79}
            height={22}
            className="cursor-pointer"
          />
        </Link>

        <p className="mt-[31px]">
          <span className="font-semibold">팀 디에듀</span> | 강이규 김나래
          김다혜 김대민 김효인 나경주 백인빈 신상호 오황석 장우성
        </p>
        <p>
          <span className="font-semibold">상호명</span> | 정성컴퍼니 <br />
          <span className="font-semibold">대표자명</span> | 조성진 <br />
          <span className="font-semibold">사업자번호</span> | 798-31-01774{' '}
          <br />
          <span className="font-semibold">사업장 주소</span> | 서울시 강남구
          역삼동 620-17 203호 <br />
          <span className="font-semibold">전화번호</span> | 010-6856-6609 <br />
        </p>
        <p>
          <span className="font-semibold">이메일</span> |{' '}
          <a href="mailto:support@dedu.kr">support@dedu.kr</a>
        </p>
      </div>
    </footer>
  );
};
