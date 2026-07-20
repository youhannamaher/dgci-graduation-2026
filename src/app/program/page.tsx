'use client';

import React from 'react';
import { useData } from '@/context/DataContext';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProgramPage() {
  const { program, isLoading } = useData();

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
          Ceremony Program
        </h1>
        <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
          Follow the event schedule during the ceremony. The timeline updates in real-time.
        </p>
      </div>

      {program.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border-gold/10">
          <AlertCircle className="h-8 w-8 text-gold mx-auto mb-2 opacity-60" />
          <p className="text-gray-400 text-sm">No program items scheduled yet.</p>
        </div>
      ) : (
        <div className="relative border-l border-gold/20 ml-3 pl-6 space-y-6 py-2">
          {program.map((item, idx) => {
            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border transition-all duration-300 ${
                    item.isCurrent
                      ? 'bg-gold border-gold shadow-[0_0_8px_#d4af37] scale-125 animate-pulse'
                      : 'bg-navy-dark border-gold/40'
                  }`}
                />

                {/* Card */}
                <div
                  className={`glass-card rounded-xl p-5 border transition-all duration-300 ${
                    item.isCurrent
                      ? 'border-gold/40 bg-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'border-gold/10 hover:border-gold/30'
                  }`}
                >
                  {/* Header / Badges */}
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-gold">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-semibold tracking-wide">{item.time}</span>
                    </div>

                    {item.isCurrent && (
                      <span className="inline-flex items-center gap-1 bg-gold text-[#050B14] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                        Now Happening
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
