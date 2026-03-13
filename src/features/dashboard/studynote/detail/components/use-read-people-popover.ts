'use client';

import { useEffect, useRef, useState } from 'react';

export const useReadPeoplePopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>('right');
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const popup = popupRef.current;

      if (!trigger || !popup) return;

      const triggerRect = trigger.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const gap = 8;

      const fitsOnRight =
        triggerRect.right + gap + popupRect.width <= viewportWidth;
      setSide(fitsOnRight ? 'right' : 'left');
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const open = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsOpen(true);
  };

  const close = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimeoutRef.current = null;
    }, 180);
  };

  return {
    isOpen,
    side,
    triggerRef,
    popupRef,
    open,
    close,
  };
};
