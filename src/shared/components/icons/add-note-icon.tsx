import React from 'react';

export const AddNoteIcon = ({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M17.3428 35.9999H9.34276C7.13361 35.9999 5.34276 34.209 5.34277 31.9999L5.34293 7.99998C5.34294 5.79085 7.1338 4 9.34293 4H27.3434C29.5525 4 31.3434 5.79086 31.3434 8V19M28.9996 35.3137V29.6568M28.9996 29.6568V24M28.9996 29.6568L23.3428 29.6569M28.9996 29.6568L34.6565 29.6569M12.3434 12H24.3434M12.3434 18H24.3434M12.3434 24H18.3434"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
