import React from 'react';

import { Spinner } from '@/shared/components/loading/spinner';

export const FullScreenLoader = ({ title }: { title: string }) => (
  <div
    role="status"
    aria-busy="true"
    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
  >
    <Spinner />
    {/* 스크린 텍스트 */}
    <div className="z-[9999] mt-64 flex flex-col items-center gap-[12px]">
      <p className="text-key-color-quaternary text-[20px] font-semibold">
        {title}
      </p>
      <p className="text-text-sub1 text-center text-[14px]">
        한 수업의 모든 순간을 한 공간에서 완성하세요
      </p>
    </div>
  </div>
);
