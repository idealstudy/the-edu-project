import React from 'react';

interface SessionContainerProps {
  tag: string;
  title: React.ReactNode;
  description: React.ReactNode;
  children?: React.ReactNode;
}

// 공통 레이아웃 컴포넌트: session 2, 3, 4 적용
export function SessionContainer({
  tag,
  title,
  description,
  children,
}: SessionContainerProps) {
  return (
    <section className="flex flex-col items-center gap-6 px-4.5 py-8">
      <div className="gap flex flex-col items-center">
        <span className="font-body2-heading text-key-color-primary bg-orange-scale-orange-5 mb-4 rounded-lg px-4 py-2">
          {tag}
        </span>
        <h2 className="font-headline2-heading mb-2 text-center">{title}</h2>
        <p className="text-gray-90 font-label-normal text-center">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}
