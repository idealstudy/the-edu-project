'use client';

interface CheckReadProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  popupRef: React.RefObject<HTMLDivElement | null>;
  open: () => void;
  close: () => void;
}

// 팝 오버의 위치 체크 wrapper
export const CheckRead = ({
  children,
  side,
  popupRef,
  open,
  close,
}: CheckReadProps) => {
  return (
    <div
      ref={popupRef}
      className={`absolute top-1/2 z-10 -translate-y-1/2 ${
        side === 'right' ? 'left-full ml-2' : 'right-full mr-2'
      }`}
      onMouseEnter={open}
      onMouseLeave={close}
    >
      {children}
    </div>
  );
};
