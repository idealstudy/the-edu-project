import Link from 'next/link';

import { PUBLIC } from '@/shared/constants';
import { Eye } from 'lucide-react';

export default function ColumnCard() {
  const handleColumnClick = () => {};

  return (
    <Link
      href={PUBLIC.COMMUNITY.COLUMN.DETAIL(1)}
      className="border-gray-3 rounded-xl border-[1.5px] bg-white"
      onClick={handleColumnClick}
    >
      {/* 상단 영역 */}
      <div className="bg-orange-1 relative h-[150px] rounded-t-xl">
        <div className="bg-gray-12/40 absolute top-4 right-4 flex items-center gap-1 rounded-lg px-2.5 py-1.5">
          <Eye
            width={16}
            color="var(--color-gray-white)"
            aria-label="조회수"
          />
          <span className="font-label-normal text-gray-white">12</span>
        </div>
      </div>

      {/* 하단 영역 */}
      <div className="border-gray-3 rounded-b-xl border-t-1 bg-white px-6 py-4">
        <p className="font-body1-heading mb-2 truncate">
          AI 코딩 도구를 활용하면 코드 생성 및 자동화, 개발 워크플로우와의 통합
        </p>
        <span>업로드한 닉네임</span>
        <div className="flex items-center justify-between gap-2">
          <div className="text-gray-7 font-caption-heading flex flex-1 gap-1 truncate">
            <span>#태그</span>
            <span>#태그</span>
            <span>#태그</span>
          </div>
          <span className="text-gray-5">3일 전 작성</span>
        </div>
      </div>
    </Link>
  );
}
