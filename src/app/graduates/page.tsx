'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { StudentAvatar } from '@/components/StudentAvatar';
import { Search, MessageSquare, UserCircle, HelpCircle, Trophy, Sparkles } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

export default function GraduatesPage() {
  const { graduates, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Filter and sort graduates
  const filteredGraduates = useMemo(() => {
    // Only show graduates with showProfile = true
    const visibleGrads = graduates.filter(g => g.showProfile);
    const sorted = [...visibleGrads].sort((a, b) => a.order - b.order);
    
    if (!searchQuery.trim()) return sorted;
    
    const query = searchQuery.toLowerCase().trim();
    return sorted.filter(
      (g) =>
        g.fullName.toLowerCase().includes(query) ||
        g.displayName.toLowerCase().includes(query) ||
        `#${String(g.order).padStart(3, '0')}`.includes(query) ||
        (g.bourse && g.bourse.toLowerCase().includes(query)) ||
        (g.masterProgram && g.masterProgram.toLowerCase().includes(query))
    );
  }, [graduates, searchQuery]);

  const displayedGraduates = useMemo(() => {
    return filteredGraduates.slice(0, visibleCount);
  }, [filteredGraduates, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-2">
          Graduate Profiles
        </h1>
        <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed font-sans">
          Browse the graduating class of 2026. Click on a graduate profile to view details, honors, and leave congratulatory messages.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gold/60" />
        </div>
        <input
          type="text"
          placeholder="Search by name, order #, or bourse/master..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-4 py-2.5 bg-[#03070d]/50 border border-gold/25 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all duration-300"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setVisibleCount(ITEMS_PER_PAGE); }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500 hover:text-gold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid Wall */}
      {filteredGraduates.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border-gold/10 max-w-md mx-auto">
          <HelpCircle className="h-8 w-8 text-gold mx-auto mb-2 opacity-60" />
          <p className="text-gray-400 text-sm">No graduates found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {displayedGraduates.map((grad) => {
            const isTopTen = grad.order <= 10 || grad.isHighestHonors;

            return (
              <div
                key={grad.id}
                className={`glass-card glass-card-hover rounded-xl p-4 border transition-all duration-300 flex flex-col items-center text-center relative group ${
                  isTopTen
                    ? 'border-gold/40 bg-gradient-to-b from-gold/10 via-[#03070d]/60 to-[#03070d]/80 gold-glow'
                    : 'border-gold/10 hover:border-gold/30'
                }`}
              >
                {/* Stage Walk Badge */}
                <div className="absolute top-2.5 right-2.5 text-[9px] bg-gold/10 text-gold px-1.5 py-0.5 rounded border border-gold/20 font-serif font-semibold">
                  #{String(grad.order).padStart(3, '0')}
                </div>

                {/* Top 10 Honors Tag */}
                {isTopTen && (
                  <div className="absolute top-2.5 left-2.5 text-[8px] bg-gold-gradient text-navy-dark px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider inline-flex items-center gap-0.5 shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                    <Trophy className="h-2.5 w-2.5" /> Top 10
                  </div>
                )}

                {/* Profile Avatar */}
                <div className="my-3 mt-4">
                  <StudentAvatar fullName={grad.fullName} photoUrl={grad.photo} size="lg" className="shadow-[0_4px_10px_rgba(0,0,0,0.4)]" />
                </div>

                {/* Name Details */}
                <div className="flex-1 mb-3">
                  <h3 className="font-serif font-bold text-xs md:text-sm text-gold-light group-hover:text-gold transition-colors duration-200 line-clamp-1">
                    {grad.fullName}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">&ldquo;{grad.displayName}&rdquo;</p>

                  {/* Bourse & Master Pills */}
                  <div className="flex flex-col gap-1 mt-2 text-[8px]">
                    {grad.bourse && (
                      <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold truncate">
                        📜 {grad.bourse}
                      </span>
                    )}
                    {grad.masterProgram && (
                      <span className="bg-blue-950/70 text-blue-200 border border-blue-500/30 px-1.5 py-0.5 rounded font-semibold truncate">
                        🇫🇷 {grad.masterProgram}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions Grid */}
                <div className="w-full grid grid-cols-2 gap-2 border-t border-gold/5 pt-3">
                  <Link
                    href={`/graduates/${grad.id}`}
                    className="inline-flex justify-center items-center gap-1 py-1.5 rounded-lg bg-gold/5 hover:bg-gold-gradient text-gold hover:text-navy-dark border border-gold/15 text-[10px] font-semibold transition-all duration-200"
                  >
                    <UserCircle className="h-3 w-3" /> Profile
                  </Link>
                  <Link
                    href={`/messages?to=${grad.id}`}
                    className="inline-flex justify-center items-center gap-1 py-1.5 rounded-lg bg-gold/5 hover:bg-gold-gradient text-gold hover:text-navy-dark border border-gold/15 text-[10px] font-semibold transition-all duration-200"
                  >
                    <MessageSquare className="h-3 w-3" /> Msg
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {filteredGraduates.length > visibleCount && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-[#03070d] border border-gold/30 hover:border-gold text-gold rounded-full text-xs font-semibold tracking-wider hover:bg-gold/5 active:scale-95 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            Load More Graduates
          </button>
        </div>
      )}

      {/* Count Display */}
      <div className="text-center text-[10px] text-gray-500 mt-8 font-sans">
        Showing {Math.min(visibleCount, filteredGraduates.length)} of {filteredGraduates.length} graduates
      </div>
    </div>
  );
}
