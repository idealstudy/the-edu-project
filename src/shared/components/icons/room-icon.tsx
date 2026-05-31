import React from 'react';

export const RoomIcon = ({
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
        d="M12.9 2.63509C13.5807 2.24209 14.4193 2.24209 15.1 2.63509L23.2923 7.36491C23.973 7.75791 24.3923 8.48419 24.3923 9.27017V18.7298C24.3923 19.5158 23.973 20.2421 23.2923 20.6351L15.1 25.3649C14.4193 25.7579 13.5807 25.7579 12.9 25.3649L4.7077 20.6351C4.02701 20.2421 3.6077 19.5158 3.6077 18.7298V9.27017C3.6077 8.48419 4.02701 7.75791 4.7077 7.36491L12.9 2.63509Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M23.5999 19.4L14 14L4.3999 19.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
