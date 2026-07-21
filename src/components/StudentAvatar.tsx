'use client';

import React, { useState } from 'react';

interface StudentAvatarProps {
  fullName: string;
  photoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  fullName,
  photoUrl,
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: 'h-9 w-9 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-20 w-20 text-lg',
    xl: 'h-28 w-28 text-2xl',
  };

  // Filter out dummy or sample photo paths to prevent 404 broken image icons
  const isDummyUrl = photoUrl && (
    photoUrl.includes('/student-') ||
    photoUrl.includes('placeholder') ||
    photoUrl.includes('sample') ||
    photoUrl.startsWith('/graduates/student')
  );

  const hasPhoto = photoUrl && photoUrl.trim() !== '' && !isDummyUrl && !imgError;

  if (hasPhoto) {
    return (
      <img
        src={photoUrl}
        alt={fullName}
        onError={() => {
          setImgError(true);
        }}
        className={`${sizeClasses[size]} rounded-full object-cover border border-gold/30 shrink-0 ${className}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // Consistent luxurious gold gradient avatar for text fallback
  const charSum = fullName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const gradients = [
    'from-[#AA771C] to-[#D4AF37]',
    'from-[#8B6508] to-[#CD9B1D]',
    'from-[#B8860B] to-[#DAA520]',
    'from-[#996515] to-[#F3E5AB] text-navy-dark'
  ];
  const gradientClass = gradients[charSum % gradients.length];

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradientClass} border border-gold/30 text-white font-serif font-extrabold flex items-center justify-center shadow-inner tracking-wide ${className}`}
    >
      {getInitials(fullName)}
    </div>
  );
};
