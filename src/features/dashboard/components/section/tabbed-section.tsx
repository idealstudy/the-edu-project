import { useState } from 'react';

import { cn } from '@/shared/lib';

type Props = {
  title: string;
  tabs: string[]; // 동일한 길이의 content
  content: React.ReactNode[];
  className?: string;
};

const TabbedSection = ({ title, tabs, content, className }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div
      className={cn(
        'flex w-full flex-col gap-6',
        'tablet:w-full tablet:gap-8',
        className
      )}
      aria-labelledby={`dashboard-section-${title}`}
    >
      <h1
        className={cn(
          'font-body1-heading tablet:font-headline1-heading text-gray-12'
        )}
      >
        {title}
      </h1>
      <div
        role="tablist"
        className="flex flex-wrap gap-2"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            aria-controls={`tabpanel-${title}-${index}`}
            id={`tab-${title}-${index}`}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'rounded-full border px-6 py-2.5 transition-colors',
              selectedIndex === index
                ? 'border-orange-7 bg-orange-2 text-orange-7 font-label-heading tablet:font-body2-heading'
                : 'border-gray-5 bg-gray-white text-gray-5 font-label-normal tablet:font-body2-normal'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${title}-${selectedIndex}`}
        aria-labelledby={`tab-${title}-${selectedIndex}`}
      >
        {content[selectedIndex]}
      </div>
    </div>
  );
};

export default TabbedSection;
