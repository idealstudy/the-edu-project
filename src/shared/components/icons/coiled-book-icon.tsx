import React from 'react';

export const CoiledBookIcon = ({
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
      <rect
        x="19.8333"
        y="5.40039"
        width="3.5"
        height="17.6"
        rx="1.1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M7 5.04221C7 4.49213 7.40634 4.02662 7.95138 3.9523L18.5847 2.5023C19.2452 2.41223 19.8333 2.92563 19.8333 3.59221V24.4052C19.8333 25.0718 19.2452 25.5852 18.5847 25.4951L7.95137 24.0451C7.40634 23.9708 7 23.5053 7 22.9552V5.04221Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4.6665 9.13867H8.55539M4.6665 13.9998H8.55539M4.6665 18.8609H8.55539"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
