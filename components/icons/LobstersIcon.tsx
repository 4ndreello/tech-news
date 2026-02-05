import React from 'react';

interface LobstersIconProps {
  size?: number;
  className?: string;
}

export default function LobstersIcon({ size = 16, className = '' }: LobstersIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="2" fill="#990000" />
      <g transform="translate(6, 8)">
        <ellipse cx="6" cy="4" rx="5" ry="3.5" fill="#CC0000" />
        <circle cx="4" cy="3" r="1" fill="white" />
        <circle cx="8" cy="3" r="1" fill="white" />
        <path d="M 3 1 L 2 0" stroke="white" strokeWidth="0.8" />
        <path d="M 9 1 L 10 0" stroke="white" strokeWidth="0.8" />
        <path d="M 2 7 L 1 8" stroke="#CC0000" strokeWidth="1.2" />
        <path d="M 4 7 L 3.5 8.5" stroke="#CC0000" strokeWidth="1.2" />
        <path d="M 8 7 L 8.5 8.5" stroke="#CC0000" strokeWidth="1.2" />
        <path d="M 10 7 L 11 8" stroke="#CC0000" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
