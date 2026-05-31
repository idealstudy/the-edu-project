import React from 'react';

export const PenIcon = ({
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
        d="M19.9617 4.14825C20.6943 2.9618 22.25 2.5939 23.4365 3.32652C24.6229 4.05914 24.9908 5.61484 24.2582 6.80128L22.7975 9.16679L18.501 6.51376L19.9617 4.14825Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M18.2733 6.82422L11.8046 17.3001C11.3537 18.0302 11.0964 18.8632 11.0568 19.7203L10.9548 21.9313C10.9177 22.734 11.7874 23.2564 12.4786 22.8467L14.3783 21.7206C15.0803 21.3044 15.671 20.7243 16.0998 20.0299L22.6032 9.49788"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M12.3602 16.7598L16.546 19.3444"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M11.9209 22.9998H5.58974C4.62823 22.9998 4.2107 21.7832 4.96958 21.1928L6.31393 20.1468C7.07281 19.5564 6.65528 18.3398 5.69377 18.3398H5.31819H1.99995"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
