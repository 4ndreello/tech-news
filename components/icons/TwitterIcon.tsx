import React from 'react';

interface TwitterIconProps {
  size?: number;
  className?: string;
}

export default function TwitterIcon({ size = 16, className = '' }: TwitterIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="2" fill="#000000" />
      <path
        d="M13.5 10.5L17.5 6H16.5L13 9.75L10.25 6H7L11.25 12.5L7 17.5H8L11.75 13.5L14.75 17.5H18L13.5 10.5ZM12.25 12.75L11.75 12L8.75 7H9.75L12.25 11L12.75 11.75L16.25 16.5H15.25L12.25 12.75Z"
        fill="white"
      />
    </svg>
  );
}
