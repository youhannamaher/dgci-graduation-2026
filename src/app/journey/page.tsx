'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { BookOpen, Calendar, Milestone, HelpCircle, Lock } from 'lucide-react';

export default function JourneyPage() {
  const { journey, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8 w-full animate-fadeIn">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-2">
          Our Journey
        </h1>
        <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
          Retrace the major milestones of the DGCI Class of 2026, from our first day to graduation.
        </p>
      </div>

      {/* Coming Soon Announcement Banner */}
      <div className="glass-card rounded-2xl p-6 border-gold/30 gold-glow text-center mb-10 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-gold/5 rounded-full flex items-center justify-center">
          <Lock className="h-10 w-10 text-gold/20" />
        </div>
        <div className="flex justify-center mb-2">
          <Lock className="h-6 w-6 text-gold animate-bounce" />
        </div>
        <h3 className="font-serif font-bold text-sm text-gold-light mb-1.5">
          Class Memory Book & Project Archive
        </h3>
        <p className="text-gray-400 text-[11px] leading-relaxed max-w-sm mx-auto">
          The full interactive media archive, including our freshman yearbook and final capstone project catalog, will be unlocked following the ceremony.
        </p>
      </div>

      {/* Journey Timeline */}
      <div className="relative border-l border-gold/20 ml-3 pl-6 space-y-8 py-2">
        {journey.map((item, index) => {
          return (
            <div key={index} className="relative group">
              {/* Timeline icon dot */}
              <div className="absolute -left-[37px] top-1.5 bg-[#050B14] p-1 rounded-full border border-gold/45 text-gold group-hover:scale-110 transition-all duration-300">
                <Milestone className="h-3.5 w-3.5" />
              </div>

              {/* Timeline content card */}
              <div className="glass-card rounded-xl p-5 border border-gold/10 hover:border-gold/30 transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-serif font-extrabold text-gold tracking-wide">
                    {item.year}
                  </span>
                  {item.isComingSoon && (
                    <span className="text-[9px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Locked
                    </span>
                  )}
                </div>
                <h3 className="font-serif font-bold text-xs md:text-sm text-gold-light mb-1.5">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
