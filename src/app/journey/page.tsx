'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { FranceFlag } from '@/components/FranceFlag';
import { BookOpen, Calendar, Milestone, Trophy, Award, GraduationCap, ArrowRight } from 'lucide-react';

export default function JourneyPage() {
  const { journey, graduates, isLoading } = useData();

  const stats = useMemo(() => {
    const totalGrads = graduates.length || 59;
    const honorsCount = graduates.filter(g => g.isHighestHonors === true || (typeof g.honorsOrder === 'number' && g.honorsOrder > 0)).length;
    const bourseCount = graduates.filter(g => g.bourse && g.bourse.trim() !== '').length || 3;
    const masterCount = graduates.filter(g => g.masterProgram && g.masterProgram.trim() !== '').length || 9;

    return { totalGrads, honorsCount, bourseCount, masterCount };
  }, [graduates]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 w-full animate-fadeIn space-y-10">
      {/* Page Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-gold/10 border border-gold/30 mb-3 text-gold">
          <Trophy className="h-6 w-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-2">
          Class Achievements & Journey
        </h1>
        <p className="text-gray-400 text-xs max-w-lg mx-auto leading-relaxed font-sans">
          Celebrating the extraordinary academic accomplishments, scholarships, French Master 2 admissions, and 4-year journey of the DGCI Class of 2026.
        </p>
      </div>

      {/* Achievement Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Graduates */}
        <div className="glass-card rounded-2xl p-4 text-center border-gold/20 flex flex-col justify-center items-center">
          <GraduationCap className="h-6 w-6 text-gold mb-1" />
          <span className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light">
            {stats.totalGrads}
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5">
            Class Graduates
          </span>
        </div>

        {/* Highest Honors */}
        <div className="glass-card rounded-2xl p-4 text-center border-gold/30 gold-glow flex flex-col justify-center items-center">
          <Trophy className="h-6 w-6 text-gold mb-1" />
          <span className="text-2xl md:text-3xl font-serif font-extrabold text-gold">
            {stats.honorsCount}
          </span>
          <span className="text-[10px] text-gold uppercase tracking-wider font-bold mt-0.5">
            Highest Honors
          </span>
        </div>

        {/* Master 2 in France */}
        <div className="glass-card rounded-2xl p-4 text-center border-blue-500/30 flex flex-col justify-center items-center">
          <FranceFlag className="w-5 h-3.5 mb-1" />
          <span className="text-2xl md:text-3xl font-serif font-extrabold text-blue-300">
            {stats.masterCount}
          </span>
          <span className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mt-0.5">
            Master 2 France
          </span>
        </div>

        {/* Bourses */}
        <div className="glass-card rounded-2xl p-4 text-center border-emerald-500/30 flex flex-col justify-center items-center">
          <span className="text-xl mb-1">📜</span>
          <span className="text-2xl md:text-3xl font-serif font-extrabold text-emerald-300">
            {stats.bourseCount}
          </span>
          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold mt-0.5">
            Bourse Winners
          </span>
        </div>
      </div>

      {/* Featured Distinction Cards */}
      <div className="space-y-4 font-sans">
        <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold font-serif text-center">
          Key Academic Distinctions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Highest Honors */}
          <div className="glass-card rounded-xl p-5 border border-gold/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-gold" />
                <h4 className="font-serif font-bold text-xs text-gold-light">Highest Honors</h4>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Awarded to the graduates with highest cumulative GPAs across the DGCI program.
              </p>
            </div>
            <Link
              href="/certificate-order?filter=honors"
              className="mt-4 text-[10px] font-bold text-gold hover:underline inline-flex items-center gap-1"
            >
              View Highest Honors <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 2: Master 2 in France */}
          <div className="glass-card rounded-xl p-5 border border-blue-500/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FranceFlag className="w-4 h-3" />
                <h4 className="font-serif font-bold text-xs text-blue-200">Master 2 in France</h4>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Graduates accepted directly into Master 2 programs at French universities including IAE Poitiers.
              </p>
            </div>
            <Link
              href="/certificate-order?filter=master"
              className="mt-4 text-[10px] font-bold text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              View M2 Candidates <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Card 3: Bourses */}
          <div className="glass-card rounded-xl p-5 border border-emerald-500/25 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">📜</span>
                <h4 className="font-serif font-bold text-xs text-emerald-200">Bourse & Scholarships</h4>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                3 graduates awarded prestigious scholarships to support their graduate research and studies in France.
              </p>
            </div>
            <Link
              href="/certificate-order?filter=bourse"
              className="mt-4 text-[10px] font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              View Bourse Winners <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Journey Timeline Header */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-gold font-bold font-serif text-center mb-6">
          DGCI 2022 – 2026 Timeline
        </h3>

        {/* Journey Timeline */}
        <div className="relative border-l border-gold/20 ml-3 pl-6 space-y-8 py-2 font-sans">
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
                      <span className="text-[9px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                        Milestone
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
    </div>
  );
}
