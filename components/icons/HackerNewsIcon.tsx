import React from 'react';

interface HackerNewsIconProps {
  size?: number;
  className?: string;
}

export default function HackerNewsIcon({ size = 16, className = '' }: HackerNewsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="2" fill="#FF6600" />
      <path
        d="M13.5 13.5V18H10.5V13.5L6 6H9L12 11.25L15 6H18L13.5 13.5Z"
        fill="white"
      />
    </svg>
  );
}
