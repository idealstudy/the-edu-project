'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import { CHARACTER_LIST } from '@/shared/constants';

export const Spinner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-[32px]">
        <div className="relative h-[160px] w-[160px]">
          {/* 외곽 회전 링 */}
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: '3s' }}
          >
            <svg
              className="h-full w-full"
              viewBox="0 0 160 160"
              fill="none"
            >
              <circle
                cx="80"
                cy="80"
                r="75"
                stroke="#ff4805"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="120 360"
                opacity="0.2"
              />
            </svg>
          </div>

          {/* 내부 역방향 회전 링 */}
          <div
            className="absolute inset-[6px] animate-spin"
            style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          >
            <svg
              className="h-full w-full"
              viewBox="0 0 148 148"
              fill="none"
            >
              <circle
                cx="74"
                cy="74"
                r="68"
                stroke="#ff4805"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="80 280"
                opacity="0.3"
              />
            </svg>
          </div>

          {/* 역할별 캐릭터 이미지 순환 */}
          <div className="absolute inset-0 flex items-center justify-center">
            {CHARACTER_LIST.map((image, index) => (
              <div
                key={index}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-1000"
                style={{
                  opacity: currentIndex === index ? 1 : 0,
                }}
              >
                <Image
                  src={image.src}
                  alt={image.label}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
