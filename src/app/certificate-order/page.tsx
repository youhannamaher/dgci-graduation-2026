'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { StudentAvatar } from '@/components/StudentAvatar';
import { FranceFlag } from '@/components/FranceFlag';
import { Search, MessageSquare, User, HelpCircle, Trophy, Award, Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';

function CertificateOrderInner() {
  const { graduates, isLoading } = useData();
  const searchParams = useSearchParams();

  const initialFilter = useMemo(() => {
    const p = searchParams.get('filter') || searchParams.get('section');
    if (p && ['all', 'honors', 'license', 'bourse', 'master'].includes(p)) {
      return p as 'all' | 'honors' | 'license' | 'bourse' | 'master';
    }
    return 'all';
  }, [searchParams]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'honors' | 'license' | 'bourse' | 'master'>(initialFilter);

  useEffect(() => {
    const p = searchParams.get('filter') || searchParams.get('section');
    if (p && ['all', 'honors', 'license', 'bourse', 'master'].includes(p)) {
      setActiveFilter(p as any);
    }
  }, [searchParams]);

  // Sorted full graduates list for License Certificate Distribution (#001 - #058)
  const licenseGraduates = useMemo(() => {
    return [...graduates].sort((a, b) => a.order - b.order);
  }, [graduates]);

  // Highest Honors graduates list (for Section 1)
  const honorsGraduates = useMemo(() => {
    return licenseGraduates
      .filter((g) => g.isHighestHonors === true || (typeof g.honorsOrder === 'number' && g.honorsOrder > 0))
      .sort((a, b) => {
        const rankA = typeof a.honorsOrder === 'number' && a.honorsOrder > 0 ? a.honorsOrder : 999;
        const rankB = typeof b.honorsOrder === 'number' && b.honorsOrder > 0 ? b.honorsOrder : 999;
        return rankA - rankB;
      });
  }, [licenseGraduates]);

  // Counts for filters
  const counts = useMemo(() => {
    const honors = honorsGraduates.length;
    const bourse = licenseGraduates.filter((g) => g.bourse && g.bourse.trim() !== '').length;
    const master = licenseGraduates.filter((g) => g.masterProgram && g.masterProgram.trim() !== '').length;
    return { all: licenseGraduates.length, honors, license: licenseGraduates.length, bourse, master };
  }, [licenseGraduates, honorsGraduates]);

  // Search filter helper
  const filterBySearch = (list: typeof graduates) => {
    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase().trim();
    return list.filter(
      (g) =>
        g.fullName.toLowerCase().includes(query) ||
        g.displayName.toLowerCase().includes(query) ||
        `#${String(g.order).padStart(3, '0')}`.includes(query) ||
        (g.honorsOrder && `#h-${String(g.honorsOrder).padStart(2, '0')}`.includes(query)) ||
        (g.bourse && g.bourse.toLowerCase().includes(query)) ||
        (g.masterProgram && g.masterProgram.toLowerCase().includes(query))
    );
  };

  const filteredHonors = useMemo(() => filterBySearch(honorsGraduates), [honorsGraduates, searchQuery]);

  const filteredLicense = useMemo(() => {
    let list = licenseGraduates;
    if (activeFilter === 'bourse') {
      list = list.filter((g) => g.bourse && g.bourse.trim() !== '');
    } else if (activeFilter === 'master') {
      list = list.filter((g) => g.masterProgram && g.masterProgram.trim() !== '');
    }
    return filterBySearch(list);
  }, [licenseGraduates, activeFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  const showHonorsSection = activeFilter === 'all' || activeFilter === 'honors';
  const showLicenseSection = activeFilter === 'all' || activeFilter === 'license' || activeFilter === 'bourse' || activeFilter === 'master';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-gold/10 border border-gold/30 mb-2 text-gold">
          <Award className="h-5 w-5" />
        </div>
        <h1 className="text-xl md:text-2xl font-serif font-extrabold text-gold-light tracking-wide mb-1.5">
          Certificate Distribution Order
        </h1>
        <p className="text-gray-400 text-xs max-w-lg mx-auto leading-relaxed font-sans">
          Celebrating our graduates across two ceremony moments: The <strong className="text-gold">🏆 Highest Honors Ceremony</strong> and the <strong className="text-gold">🎓 License Certificate Distribution</strong> (All 58 Graduates).
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-2.5 mb-5">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-[#03070d]/60 border border-gold/15 p-1.5 rounded-xl text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-gold-gradient text-navy-dark shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-gray-400 hover:text-gold hover:bg-gold/5'
            }`}
          >
            All Certificates ({counts.all})
          </button>
          <button
            onClick={() => setActiveFilter('honors')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              activeFilter === 'honors'
                ? 'bg-gold-gradient text-navy-dark shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-gray-400 hover:text-gold hover:bg-gold/5'
            }`}
          >
            <Trophy className="h-3 w-3" /> Highest Honors Order ({counts.honors})
          </button>
          <button
            onClick={() => setActiveFilter('license')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              activeFilter === 'license'
                ? 'bg-gold-gradient text-navy-dark shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'text-gray-400 hover:text-gold hover:bg-gold/5'
            }`}
          >
            <GraduationCap className="h-3 w-3" /> License Order ({counts.license})
          </button>
          <button
            onClick={() => setActiveFilter('bourse')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1 ${
              activeFilter === 'bourse'
                ? 'bg-emerald-500 text-navy-dark shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            📜 Bourse ({counts.bourse})
          </button>
          <button
            onClick={() => setActiveFilter('master')}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all inline-flex items-center gap-1.5 ${
              activeFilter === 'master'
                ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
            }`}
          >
            <FranceFlag className="w-3.5 h-2.5" /> M2 France ({counts.master})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gold/60" />
          </div>
          <input
            type="text"
            placeholder="Search student by name, order #, bourse, or master..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2 bg-[#03070d]/70 border border-gold/25 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all"
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

      <div className="space-y-6">
        {/* SECTION 1: HIGHEST HONORS CEREMONY */}
        {showHonorsSection && filteredHonors.length > 0 && (
          <div className="space-y-2">
            <div className="pt-1 pb-1 flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-gold/25"></div>
              <span className="text-[10px] font-serif font-bold text-gold uppercase tracking-[0.2em] inline-flex items-center gap-1.5 bg-gold/10 px-3 py-0.5 rounded-full border border-gold/30 gold-glow">
                <Trophy className="h-3 w-3" /> Highest Honors Ceremony
              </span>
              <div className="h-[1px] flex-1 bg-gold/25"></div>
            </div>

            {filteredHonors.map((grad, idx) => {
              const honorsRankStr = grad.honorsOrder ? `#H-${String(grad.honorsOrder).padStart(2, '0')}` : `#H-${String(idx + 1).padStart(2, '0')}`;

              return (
                <div
                  key={`honors-${grad.id}`}
                  className="glass-card rounded-xl p-3.5 border border-gold/40 bg-gradient-to-r from-gold/10 via-[#03070d]/60 to-[#03070d]/60 gold-glow flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left relative"
                >
                  <div className="flex items-center gap-3">
                    {/* Honors Rank Badge */}
                    <div className="flex flex-col items-center justify-center min-w-10">
                      <Trophy className="h-4 w-4 text-gold mb-0.5" />
                      <span className="font-serif text-[10px] font-bold text-gold">
                        {honorsRankStr}
                      </span>
                    </div>

                    <StudentAvatar fullName={grad.fullName} photoUrl={grad.photo} size="md" />

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <h3 className="font-serif font-bold text-xs md:text-sm text-gold-light leading-snug">
                          {grad.fullName}
                        </h3>

                        <span className="bg-gold-gradient text-navy-dark px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-0.5 shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                          <Sparkles className="h-2.5 w-2.5" /> Highest Honors
                        </span>
                      </div>

                      <span className="text-[10px] text-gray-400 font-sans block mb-1">
                        License Walk Order <strong className="text-gold/90">#{String(grad.order).padStart(3, '0')}</strong>
                      </span>

                      <div className="flex flex-wrap gap-1.5 text-[9px]">
                        {grad.bourse && (
                          <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                            📜 {grad.bourse}
                          </span>
                        )}
                        {grad.masterProgram && (
                          <span className="bg-blue-950/60 text-blue-200 border border-blue-500/30 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1.5 max-w-[240px] sm:max-w-none truncate">
                            <FranceFlag className="w-3 h-2 shrink-0" /> <span className="truncate">{grad.masterProgram}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/graduates/${grad.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/25 text-gold hover:bg-gold-gradient hover:text-navy-dark text-[11px] font-bold transition-all inline-flex items-center gap-1"
                    >
                      <User className="h-3.5 w-3.5" /> Profile
                    </Link>
                    <Link
                      href={`/messages?to=${grad.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/25 text-gold hover:bg-gold-gradient hover:text-navy-dark text-[11px] font-bold transition-all inline-flex items-center gap-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SECTION 2: LICENSE CERTIFICATE DISTRIBUTION (ALL 58 GRADUATES) */}
        {showLicenseSection && filteredLicense.length > 0 && (
          <div className="space-y-3">
            <div className="pt-4 pb-1 flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-gold/25"></div>
              <span className="text-[11px] font-serif font-bold text-gray-200 uppercase tracking-[0.2em] inline-flex items-center gap-1.5 bg-[#03070d] px-3.5 py-1 rounded-full border border-gold/20">
                <GraduationCap className="h-3.5 w-3.5 text-gold" /> License Certificate Distribution (All Graduates #001 - #058)
              </span>
              <div className="h-[1px] flex-1 bg-gold/25"></div>
            </div>

            {filteredLicense.map((grad) => {
              const isHighestHonors = grad.isHighestHonors === true || (typeof grad.honorsOrder === 'number' && grad.honorsOrder > 0);

              return (
                <div
                  key={`license-${grad.id}`}
                  className={`glass-card rounded-xl p-3.5 border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left relative ${
                    isHighestHonors
                      ? 'border-gold/30 bg-gradient-to-r from-gold/5 via-[#03070d]/60 to-[#03070d]/60'
                      : 'border-gold/10 hover:border-gold/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Main License Stage Walk Order Badge */}
                    <div className="flex flex-col items-center justify-center min-w-10">
                      <span className="font-serif text-xs font-bold text-gold">
                        #{String(grad.order).padStart(3, '0')}
                      </span>
                    </div>

                    <StudentAvatar fullName={grad.fullName} photoUrl={grad.photo} size="md" />

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <h3 className="font-serif font-bold text-xs md:text-sm text-gold-light leading-snug">
                          {grad.fullName}
                        </h3>

                        {isHighestHonors && (
                          <span className="bg-gold-gradient text-navy-dark px-2 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider inline-flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> Highest Honors
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5 text-[9px] mt-1">
                        {grad.bourse && (
                          <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                            📜 {grad.bourse}
                          </span>
                        )}
                        {grad.masterProgram && (
                          <span className="bg-blue-950/60 text-blue-200 border border-blue-500/30 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1.5 max-w-[240px] sm:max-w-none truncate">
                            <FranceFlag className="w-3 h-2 shrink-0" /> <span className="truncate">{grad.masterProgram}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/graduates/${grad.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/25 text-gold hover:bg-gold-gradient hover:text-navy-dark text-[11px] font-bold transition-all inline-flex items-center gap-1"
                    >
                      <User className="h-3.5 w-3.5" /> Profile
                    </Link>
                    <Link
                      href={`/messages?to=${grad.id}`}
                      className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/25 text-gold hover:bg-gold-gradient hover:text-navy-dark text-[11px] font-bold transition-all inline-flex items-center gap-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {((showHonorsSection && filteredHonors.length === 0) && (showLicenseSection && filteredLicense.length === 0)) && (
          <div className="glass-card rounded-xl p-8 text-center border-gold/10 max-w-md mx-auto my-6">
            <HelpCircle className="h-8 w-8 text-gold mx-auto mb-2 opacity-60" />
            <p className="text-gray-400 text-sm">No graduates found for this filter selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CertificateOrderPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div></div>}>
      <CertificateOrderInner />
    </Suspense>
  );
}
