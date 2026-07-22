'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { StudentAvatar } from '@/components/StudentAvatar';
import { Search, MessageSquare, User, HelpCircle, Trophy, Award, Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';

const ITEMS_PER_PAGE = 60; // Show all or paginated cleanly

export default function CertificateOrderPage() {
  const { graduates, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'honors' | 'bourse' | 'master'>('all');

  // Sorted graduates
  const sortedGraduates = useMemo(() => {
    return [...graduates].sort((a, b) => a.order - b.order);
  }, [graduates]);

  // Counts for filters
  const counts = useMemo(() => {
    const honors = sortedGraduates.filter(g => g.order <= 10 || g.isHighestHonors).length;
    const bourse = sortedGraduates.filter(g => g.bourse && g.bourse.trim() !== '').length;
    const master = sortedGraduates.filter(g => g.masterProgram && g.masterProgram.trim() !== '').length;
    return { all: sortedGraduates.length, honors, bourse, master };
  }, [sortedGraduates]);

  // Filtered list
  const filteredGraduates = useMemo(() => {
    let list = sortedGraduates;

    // Filter tab
    if (activeFilter === 'honors') {
      list = list.filter(g => g.order <= 10 || g.isHighestHonors);
    } else if (activeFilter === 'bourse') {
      list = list.filter(g => g.bourse && g.bourse.trim() !== '');
    } else if (activeFilter === 'master') {
      list = list.filter(g => g.masterProgram && g.masterProgram.trim() !== '');
    }

    // Search query
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (g) =>
        g.fullName.toLowerCase().includes(query) ||
        g.displayName.toLowerCase().includes(query) ||
        `#${String(g.order).padStart(3, '0')}`.includes(query) ||
        (g.bourse && g.bourse.toLowerCase().includes(query)) ||
        (g.masterProgram && g.masterProgram.toLowerCase().includes(query))
    );
  }, [sortedGraduates, activeFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-gold/10 border border-gold/30 mb-3 text-gold">
          <Award className="h-6 w-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-2">
          Certificate Distribution Order
        </h1>
        <p className="text-gray-400 text-xs max-w-lg mx-auto leading-relaxed font-sans">
          The first 10 positions (<strong className="text-gold">#001 - #010</strong>) are awarded to the <strong className="text-gold">Top 10 Highest Honors</strong> graduates, followed by alphabetical stage walk order (#011 - #059).
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3 mb-6">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-[#03070d]/60 border border-gold/15 p-2 rounded-xl text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-gold-gradient text-navy-dark shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-gray-400 hover:text-gold hover:bg-gold/5'
            }`}
          >
            All Graduates ({counts.all})
          </button>
          <button
            onClick={() => setActiveFilter('honors')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              activeFilter === 'honors'
                ? 'bg-gold-gradient text-navy-dark shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-gray-400 hover:text-gold hover:bg-gold/5'
            }`}
          >
            <Trophy className="h-3 w-3" /> Top 10 Honors ({counts.honors})
          </button>
          <button
            onClick={() => setActiveFilter('bourse')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              activeFilter === 'bourse'
                ? 'bg-emerald-500 text-navy-dark shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            📜 Bourse ({counts.bourse})
          </button>
          <button
            onClick={() => setActiveFilter('master')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              activeFilter === 'master'
                ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
            }`}
          >
            🇫🇷 M2 France ({counts.master})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gold/60" />
          </div>
          <input
            type="text"
            placeholder="Search by name, order #, bourse, or master..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-[#03070d]/70 border border-gold/25 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500 hover:text-gold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Graduation List */}
      {filteredGraduates.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border-gold/10">
          <HelpCircle className="h-8 w-8 text-gold mx-auto mb-2 opacity-60" />
          <p className="text-gray-400 text-xs">No graduates match your selection.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGraduates.map((grad, index) => {
            const isTopTen = grad.order <= 10 || grad.isHighestHonors;
            const showHonorsHeader = activeFilter === 'all' && index === 0 && isTopTen;
            const showAlphabeticalHeader = activeFilter === 'all' && index === 10;

            return (
              <React.Fragment key={grad.id}>
                {/* Section Header: Top 10 Honors */}
                {showHonorsHeader && (
                  <div className="pt-2 pb-1 flex items-center gap-2">
                    <div className="h-[1px] flex-1 bg-gold/25"></div>
                    <span className="text-[11px] font-serif font-bold text-gold uppercase tracking-[0.2em] inline-flex items-center gap-1.5 bg-gold/10 px-3 py-1 rounded-full border border-gold/30">
                      <Trophy className="h-3.5 w-3.5" /> Top 10 Highest Honors
                    </span>
                    <div className="h-[1px] flex-1 bg-gold/25"></div>
                  </div>
                )}

                {/* Section Header: Alphabetical Graduates */}
                {showAlphabeticalHeader && (
                  <div className="pt-6 pb-1 flex items-center gap-2">
                    <div className="h-[1px] flex-1 bg-gold/25"></div>
                    <span className="text-[11px] font-serif font-bold text-gray-300 uppercase tracking-[0.2em] inline-flex items-center gap-1.5 bg-[#03070d] px-3 py-1 rounded-full border border-gold/20">
                      <GraduationCap className="h-3.5 w-3.5 text-gold/80" /> Graduates (Alphabetical Order)
                    </span>
                    <div className="h-[1px] flex-1 bg-gold/25"></div>
                  </div>
                )}

                {/* Graduate Row Card */}
                <div
                  className={`glass-card rounded-xl p-3.5 border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left relative ${
                    isTopTen
                      ? 'border-gold/40 bg-gradient-to-r from-gold/10 via-[#03070d]/60 to-[#03070d]/60 gold-glow'
                      : 'border-gold/10 hover:border-gold/30'
                  }`}
                >
                  {/* Left Section: Order Badge, Avatar & Details */}
                  <div className="flex items-center gap-3">
                    {/* Order Index Badge */}
                    <div className="flex flex-col items-center justify-center min-w-10">
                      {isTopTen ? (
                        <div className="flex flex-col items-center">
                          <Trophy className="h-4 w-4 text-gold mb-0.5" />
                          <span className="font-serif text-xs font-bold text-gold">
                            #{String(grad.order).padStart(3, '0')}
                          </span>
                        </div>
                      ) : (
                        <span className="font-serif text-xs font-bold text-gold/70">
                          #{String(grad.order).padStart(3, '0')}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <StudentAvatar fullName={grad.fullName} photoUrl={grad.photo} size="md" />

                    {/* Name & Achievement Badges */}
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <h3 className="font-serif font-bold text-xs md:text-sm text-gold-light leading-snug">
                          {grad.fullName}
                        </h3>

                        {/* Top 10 Honor Pill */}
                        {isTopTen && (
                          <span className="bg-gold-gradient text-navy-dark px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-0.5 shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                            <Sparkles className="h-2.5 w-2.5" /> Top 10 Honors
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-gray-400 font-sans block mb-1">
                        &ldquo;{grad.displayName}&rdquo;
                      </span>

                      {/* Bourse & Master 2 Badges */}
                      <div className="flex flex-wrap gap-1.5 text-[9px]">
                        {grad.bourse && (
                          <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                            📜 {grad.bourse}
                          </span>
                        )}
                        {grad.masterProgram && (
                          <span className="bg-blue-950/60 text-blue-200 border border-blue-500/30 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                            🇫🇷 {grad.masterProgram}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/graduates/${grad.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/25 text-gold hover:bg-gold-gradient hover:text-navy-dark text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      title="View Profile"
                    >
                      <User className="h-3.5 w-3.5" /> Profile
                    </Link>
                    <Link
                      href={`/messages?to=${grad.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/25 text-gold hover:bg-gold-gradient hover:text-navy-dark text-[11px] font-bold transition-all inline-flex items-center gap-1"
                      title="Leave Message"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Link>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* Helper Footer */}
      <div className="text-center text-[10px] text-gray-500 mt-8 font-sans">
        Showing {filteredGraduates.length} of {sortedGraduates.length} graduates
      </div>
    </div>
  );
}
