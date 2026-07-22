import React from 'react';

export const FranceFlag: React.FC<{ className?: string }> = ({ className = 'w-4 h-3' }) => (
  <svg
    className={`inline-block rounded-[2px] overflow-hidden border border-white/25 align-middle shrink-0 shadow-sm ${className}`}
    viewBox="0 0 3 2"
    aria-label="France Flag"
  >
    <rect width="1" height="2" x="0" fill="#002395" />
    <rect width="1" height="2" x="1" fill="#FFFFFF" />
    <rect width="1" height="2" x="2" fill="#ED2939" />
  </svg>
);
