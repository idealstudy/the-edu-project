import React from 'react';

export const TextIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L20.6603 7V17L12 22L3.33975 17V7L12 2Z"
        strokeLinejoin="round"
      />
      <path
        d="M20 16.5L12.0001 12L4 16.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
