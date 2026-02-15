'use client';

import { useState } from 'react';

import Image from 'next/image';

import { FAQ_DATA } from '@/features/home/constants/faq-data';
import { cn } from '@/shared/lib';

// Session6: FAQ
export function Session6() {
  return (
    <section
      className={cn(
        'mx-auto my-8 flex w-81 flex-col gap-6',
        'tablet:my-12 tablet:gap-8 tablet:w-152',
        'desktop:my-20 desktop:w-228'
      )}
    >
      <h2 className={cn('font-headline1-heading', 'desktop:font-display-2')}>
        자주 묻는 질문
      </h2>
      <FAQAccordion />
    </section>
  );
}

// FAQAccordion 컴포넌트
const FAQAccordion = () => {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {FAQ_DATA.map((item, index) => (
        <div
          key={index}
          className="border-gray-scale-gray-95 border"
        >
          {/* 질문 */}
          <button
            id={`faq-button-${index}`}
            aria-expanded={activeTab === index}
            aria-controls={`faq-panel-${index}`}
            onClick={() => setActiveTab(activeTab === index ? null : index)}
            className={cn(
              'font-body2-heading hover:bg-orange-7 flex w-full cursor-pointer px-6 py-5 text-start hover:text-white',
              'tablet:p-8 tablet:font-headline2-heading'
            )}
          >
            <p className="flex-1">{item.question}</p>
            <Image
              src="/ic-arrow-right.svg"
              alt={activeTab === index ? '질문 접기' : '질문 펼치기'}
              width={16}
              height={16}
              className={cn(
                'aspect-auto w-4',
                'tablet:w-6',
                activeTab === index && 'rotate-90'
              )}
            />
          </button>

          {/* 답변 */}
          {activeTab === index && (
            <>
              <hr
                className={cn('border-line-line1 mx-6 border', 'tablet:mx-8')}
                aria-hidden
              />

              <div
                id={`faq-panel-${index}`}
                role="region"
                aria-labelledby={`faq-button-${index}`}
                className={cn(
                  'font-label-normal space-y-2 px-6 py-5',
                  'tablet:p-8 tablet:font-body2-normal'
                )}
              >
                {item.answer.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
