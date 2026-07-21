'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { GraduationCap, MapPin, ExternalLink, MessageCircle } from 'lucide-react';

export const Footer = () => {
  const { ceremonyInfo, dbSource, refreshData } = useData();

  return (
    <footer className="w-full bg-[#03070d] border-t border-gold/15 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center">
        {/* Logo and title */}
        <div className="flex justify-center items-center gap-2 mb-3">
          <GraduationCap className="h-5 w-5 text-gold" />
          <span className="font-serif font-semibold text-base tracking-wider text-gold-light">
            {ceremonyInfo.title}
          </span>
        </div>

        {/* Subtitle / Venue */}
        <p className="text-gray-400 text-xs max-w-md mx-auto mb-4 font-sans leading-relaxed">
          {ceremonyInfo.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-xs text-gray-500 mb-6">
          <span>{ceremonyInfo.date} • {ceremonyInfo.time}</span>
          <span className="hidden sm:inline">•</span>
          {ceremonyInfo.locationUrl ? (
            <a
              href={ceremonyInfo.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gold hover:underline"
            >
              <MapPin className="h-3 w-3" />
              {ceremonyInfo.venue}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            <span>{ceremonyInfo.venue}</span>
          )}
        </div>

        {/* Closing note */}
        <p className="text-[11px] italic text-gold/60 mb-6">
          &ldquo;{ceremonyInfo.closingMessage}&rdquo;
        </p>

        {/* Copy and Admin Link */}
        <div className="border-t border-gold/5 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-gray-600">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p>© {new Date().getFullYear()} DGCI Graduation. All rights reserved.</p>
            <p className="text-gray-500">
              Built with <a href="https://youhannamaher.github.io/" target="_blank" rel="noopener noreferrer" className="text-gold/80 hover:text-gold transition-colors font-semibold">Youhanna Maher</a>
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <a
              href="https://www.instagram.com/dgci2026?igsh=aWdpYmxxMGxhOGRj"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors font-medium"
            >
              Instagram
            </a>
            <Link href="/admin" className="hover:text-gold transition-colors font-medium">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
