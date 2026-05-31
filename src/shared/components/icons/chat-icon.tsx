import React from 'react';

export const ChatIcon = ({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.7166 13.9989C11.184 13.9989 11.5628 13.6201 11.5628 13.1528C11.5628 12.6855 11.184 12.3066 10.7166 12.3066C10.2493 12.3066 9.87048 12.6855 9.87048 13.1528C9.87048 13.6201 10.2493 13.9989 10.7166 13.9989Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.9089 13.9989C15.3762 13.9989 15.7551 13.6201 15.7551 13.1528C15.7551 12.6855 15.3762 12.3066 14.9089 12.3066C14.4416 12.3066 14.0627 12.6855 14.0627 13.1528C14.0627 13.6201 14.4416 13.9989 14.9089 13.9989Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.1012 13.9989C19.5685 13.9989 19.9473 13.6201 19.9473 13.1528C19.9473 12.6855 19.5685 12.3066 19.1012 12.3066C18.6338 12.3066 18.255 12.6855 18.255 13.1528C18.255 13.6201 18.6338 13.9989 19.1012 13.9989Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1538 22.4615L4 24L5.53846 19.3846V5.53846C5.53846 5.13044 5.70055 4.73912 5.98907 4.4506C6.27758 4.16209 6.6689 4 7.07692 4H22.4615C22.8696 4 23.2609 4.16209 23.5494 4.4506C23.8379 4.73912 24 5.13044 24 5.53846V20.9231C24 21.3311 23.8379 21.7224 23.5494 22.0109C23.2609 22.2995 22.8696 22.4615 22.4615 22.4615H10.1538Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
