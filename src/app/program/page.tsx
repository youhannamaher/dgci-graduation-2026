'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { calculateProgramSchedule } from '@/lib/programUtils';
import { Clock, CheckCircle2, AlertCircle, Sparkles, Timer, Calendar, Trophy, GraduationCap, ArrowRight } from 'lucide-react';

export default function ProgramPage() {
  const { program, ceremonyInfo, isLoading } = useData();

  // Dynamic program schedule calculation
  const { calculatedItems, totalDurationMinutes, ceremonyEndTime, formattedTotalDuration } =
    calculateProgramSchedule(program, ceremonyInfo.time || '6:30 PM');

  const currentItem = calculatedItems.find((i) => i.isCurrent);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full animate-fadeIn">
      {/* Page Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-gold/10 border border-gold/30 mb-2 text-gold">
          <Clock className="h-5 w-5" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-1.5">
          Ceremony Program
        </h1>
        <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
          Follow the official DGCI 2026 graduation timeline. Timings update dynamically in real-time during the event.
        </p>
      </div>

      {/* Dynamic Ceremony Schedule Summary Banner */}
      <div className="glass-card rounded-2xl p-4 mb-8 border border-gold/25 bg-gradient-to-r from-gold/10 via-[#03070d]/80 to-[#03070d]/80 gold-glow">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-[#03070d]/60 border border-gold/15">
            <span className="text-[10px] text-gray-400 block mb-0.5 font-sans">Ceremony Start</span>
            <strong className="text-gold font-serif text-xs sm:text-sm">{ceremonyInfo.time || '6:30 PM'}</strong>
          </div>
          <div className="p-2 rounded-xl bg-[#03070d]/60 border border-gold/15">
            <span className="text-[10px] text-gray-400 block mb-0.5 font-sans">Total Duration</span>
            <strong className="text-gold font-serif text-xs sm:text-sm">{formattedTotalDuration}</strong>
          </div>
          <div className="p-2 rounded-xl bg-[#03070d]/60 border border-gold/15">
            <span className="text-[10px] text-gray-400 block mb-0.5 font-sans">Est. Completion</span>
            <strong className="text-gold font-serif text-xs sm:text-sm">{ceremonyEndTime}</strong>
          </div>
        </div>

        {/* Currently Happening Highlight Banner */}
        {currentItem && (
          <div className="mt-3 pt-3 border-t border-gold/15 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold"></span>
              </span>
              <span className="text-gray-300 font-sans text-[11px] truncate">
                Now Happening: <strong className="text-gold font-serif">{currentItem.title}</strong>
              </span>
            </div>
            <span className="text-[10px] text-gold/80 font-mono bg-gold/10 px-2 py-0.5 rounded border border-gold/20 shrink-0">
              {currentItem.formattedRange}
            </span>
          </div>
        )}
      </div>

      {calculatedItems.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border-gold/10">
          <AlertCircle className="h-8 w-8 text-gold mx-auto mb-2 opacity-60" />
          <p className="text-gray-400 text-sm">No program items scheduled yet.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-gold/20 ml-3.5 pl-6 space-y-5 py-1">
          {calculatedItems.map((item) => {
            const isHonorsItem = item.id === 'prog-7' || item.title.toLowerCase().includes('highest honors');
            const isLicenseItem = item.id === 'prog-11' || item.title.toLowerCase().includes('license certificates');

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[32px] top-2 h-4 w-4 rounded-full border transition-all duration-300 ${
                    item.isCurrent
                      ? 'bg-gold border-gold shadow-[0_0_12px_#d4af37] scale-125 animate-pulse'
                      : 'bg-navy-dark border-gold/40'
                  }`}
                />

                {/* Event Card */}
                <div
                  className={`glass-card rounded-xl p-4 border transition-all duration-300 ${
                    item.isCurrent
                      ? 'border-gold/50 bg-gradient-to-r from-gold/15 via-[#03070d]/80 to-[#03070d]/80 shadow-[0_0_18px_rgba(212,175,55,0.2)] gold-glow'
                      : 'border-gold/10 hover:border-gold/30'
                  }`}
                >
                  {/* Header / Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gold tracking-wide font-mono inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-gold/80" /> {item.formattedRange}
                      </span>
                      <span className="text-[9px] text-gray-400 bg-gold/5 px-2 py-0.5 rounded border border-gold/15 font-sans">
                        ⏱️ {item.durationMinutes} mins
                      </span>
                    </div>

                    {item.isCurrent && (
                      <span className="inline-flex items-center gap-1 bg-gold text-[#050B14] text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.4)]">
                        <Sparkles className="h-2.5 w-2.5" /> Now Happening
                      </span>
                    )}
                  </div>

                  {/* Title & Body */}
                  <h3
                    className={`font-serif font-bold text-sm tracking-wide mb-1 transition-colors ${
                      item.isCurrent ? 'text-gold' : 'text-gold-light'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-sans">
                    {item.description}
                  </p>

                  {/* Direct Link Actions */}
                  {isHonorsItem && (
                    <div className="mt-3 pt-2.5 border-t border-gold/15 flex justify-end">
                      <Link
                        href="/certificate-order?filter=honors"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold-gradient text-gold hover:text-navy-dark border border-gold/25 text-[11px] font-bold transition-all shadow-sm group/btn"
                      >
                        <Trophy className="h-3.5 w-3.5" /> View Highest Honors Order <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  )}

                  {isLicenseItem && (
                    <div className="mt-3 pt-2.5 border-t border-gold/15 flex justify-end">
                      <Link
                        href="/certificate-order?filter=license"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold-gradient text-gold hover:text-navy-dark border border-gold/25 text-[11px] font-bold transition-all shadow-sm group/btn"
                      >
                        <GraduationCap className="h-3.5 w-3.5" /> View License Walk Order <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
