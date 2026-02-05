import React from 'react';

interface DevToIconProps {
  size?: number;
  className?: string;
}

export default function DevToIcon({ size = 16, className = '' }: DevToIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="2" fill="#0A0A0A" />
      <path
        d="M7.5 9.5C7.5 9.5 7 9.5 7 10V14C7 14.5 7.5 14.5 7.5 14.5H8.5C9 14.5 9.5 14 9.5 13.5V10.5C9.5 10 9 9.5 8.5 9.5H7.5Z"
        fill="white"
      />
      <path
        d="M11 9.5V14.5H13.5C14 14.5 14.5 14 14.5 13.5V10.5C14.5 10 14 9.5 13.5 9.5H11ZM12 10.5H13V13.5H12V10.5Z"
        fill="white"
      />
      <path
        d="M15.5 9.5V11H17V12H15.5V13.5H17.5V14.5H15V9.5H17.5V10.5H15.5Z"
        fill="white"
      />
    </svg>
  );
}
