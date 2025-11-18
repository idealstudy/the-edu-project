import React from 'react';

export const HomeIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.8848 19.2949C19.8848 20.3995 18.9893 21.2949 17.8848 21.2949H5.88477C4.7802 21.2949 3.88477 20.3995 3.88477 19.2949V10.6551C3.88477 10.1023 4.11358 9.57415 4.51687 9.19606L10.5112 3.57625C11.2801 2.85545 12.4763 2.85494 13.2458 3.57509L19.2514 9.19591C19.6555 9.57406 19.8848 10.1027 19.8848 10.6561V19.2949Z" />
      <path
        d="M12 15V20"
        strokeLinecap="round"
      />
    </svg>
  );
};
