import React from 'react';

interface TabNewsIconProps {
  size?: number;
  className?: string;
}

export default function TabNewsIcon({ size = 16, className = '' }: TabNewsIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="2" fill="#2474E0" />
      <path
        d="M7 7H17V9.5H14.5V18H10V9.5H7V7Z"
        fill="white"
      />
    </svg>
  );
}
