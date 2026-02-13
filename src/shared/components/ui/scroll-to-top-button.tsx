'use client';

import { useEffect, useState } from 'react';
import { IoIosArrowUp } from 'react-icons/io';

import { cn } from '@/shared/lib';

const SHOW_OFFSET = 240;

// Scroll page to top
export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SHOW_OFFSET);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to top"
      className={cn(
        'fixed right-4 bottom-10 z-50 cursor-pointer',
        'tablet:right-8',
        'bg-key-color-primary hover:bg-key-color-secondary',
        'rounded-full p-2.5 text-white shadow-md',
        'desktop:p-3',
        'transition-all duration-200',
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0'
      )}
    >
      <IoIosArrowUp className="tablet:h-6 tablet:w-6 h-5 w-5" />
    </button>
  );
};
