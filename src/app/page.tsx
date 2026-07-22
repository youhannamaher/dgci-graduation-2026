'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { StudentAvatar } from '@/components/StudentAvatar';
import { FranceFlag } from '@/components/FranceFlag';
import { Calendar, Clock, MapPin, CalendarDays, ArrowRight, Award, MessageSquare, Image as ImageIcon, Users, BookOpen, Search, Sparkles, Trophy, Heart } from 'lucide-react';

export default function HomePage() {
  const { ceremonyInfo, graduates } = useData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    // Target date: Sunday, July 26, 2026, at 6:00 PM
    const targetDate = new Date('2026-07-26T18:00:00');

    const updateTimer = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Quick Instant Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return graduates
      .filter(g => g.showProfile && (g.fullName.toLowerCase().includes(q) || g.displayName.toLowerCase().includes(q)))
      .slice(0, 5);
  }, [searchQuery, graduates]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto w-full space-y-10">
      {/* Banner Arch Hero Header */}
      <div className="w-full arch-frame bg-gradient-to-b from-[#0e213d] via-[#071120] to-[#050b15] p-6 md:p-10 text-center relative overflow-hidden gold-glow">
        <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 px-3.5 py-1 rounded-full text-[10px] text-gold font-serif uppercase tracking-[0.25em] font-bold mb-4">
          <FranceFlag className="w-3.5 h-2.5" /> Class of {ceremonyInfo.classYear} Graduation
        </div>

        <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-gold-light tracking-wide mb-3 px-2">
          {ceremonyInfo.title}
        </h1>

        <p className="text-cream/80 font-sans text-xs md:text-sm max-w-lg mx-auto leading-relaxed mt-1 px-4">
          {ceremonyInfo.subtitle}
        </p>

        {/* Quick Instant Search Input */}
        <div className="mt-8 max-w-lg mx-auto relative font-sans">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gold">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search any graduate by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 bg-[#071120]/90 border-2 border-gold/40 rounded-full text-xs text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 shadow-xl transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#071120] border border-gold/40 rounded-2xl p-2 shadow-2xl z-50 text-left space-y-1">
              <div className="text-[10px] text-gold font-bold px-3 py-1 border-b border-gold/15 uppercase tracking-wider">
                Matching Graduates
              </div>
              {searchResults.map((g) => (
                <Link
                  key={g.id}
                  href={`/graduates/${g.id}`}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-gold/10 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <StudentAvatar fullName={g.fullName} photoUrl={g.photo} size="sm" />
                    <div>
                      <strong className="text-gold-light group-hover:text-gold block">{g.fullName}</strong>
                      <span className="text-[10px] text-gray-400">Order Walk #{String(g.order).padStart(3, '0')}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gold font-bold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                    View Profile →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Countdown Timer & Ceremony Details Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countdown Timer */}
        <div className="glass-card rounded-2xl p-6 text-center border-gold/30 gold-glow flex flex-col justify-center">
          {timeLeft.isOver ? (
            <div className="py-2">
              <span className="inline-block bg-gold-gradient text-navy-dark px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                Ceremony Live
              </span>
              <h3 className="text-xl font-serif font-semibold text-gold-light">The Celebration Has Commenced</h3>
            </div>
          ) : (
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold block mb-3 font-serif">
                COUNTDOWN TO CEREMONY
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#03070d]/60 rounded-xl p-2.5 border border-gold/15">
                  <span className="block text-2xl md:text-3xl font-serif text-gold-light font-bold">
                    {timeLeft.days}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Days</span>
                </div>
                <div className="bg-[#03070d]/60 rounded-xl p-2.5 border border-gold/15">
                  <span className="block text-2xl md:text-3xl font-serif text-gold-light font-bold">
                    {timeLeft.hours}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Hrs</span>
                </div>
                <div className="bg-[#03070d]/60 rounded-xl p-2.5 border border-gold/15">
                  <span className="block text-2xl md:text-3xl font-serif text-gold-light font-bold">
                    {timeLeft.minutes}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Min</span>
                </div>
                <div className="bg-[#03070d]/60 rounded-xl p-2.5 border border-gold/15">
                  <span className="block text-2xl md:text-3xl font-serif text-gold-light font-bold">
                    {timeLeft.seconds}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold">Sec</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ceremony Venue & Time Info */}
        <div className="glass-card rounded-2xl p-6 border-gold/20 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold block mb-3 font-serif">
              CEREMONY VENUE & TIME
            </span>
            <div className="space-y-3 font-sans">
              <div className="flex items-center gap-3 text-xs md:text-sm text-gray-200">
                <Calendar className="h-4 w-4 text-gold shrink-0" />
                <span>{ceremonyInfo.date}</span>
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm text-gray-200">
                <Clock className="h-4 w-4 text-gold shrink-0" />
                <span>{ceremonyInfo.time}</span>
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm text-gray-200">
                <MapPin className="h-4 w-4 text-gold shrink-0" />
                <span>{ceremonyInfo.venue}</span>
              </div>
            </div>
          </div>

          {ceremonyInfo.locationUrl && (
            <a
              href={ceremonyInfo.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center bg-gold-gradient text-navy-dark px-4 py-2 rounded-full text-xs font-bold tracking-wider hover:bg-gold-gradient-hover active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              Open Google Maps Location <ArrowRight className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* User-Friendly Quick Action Guide (What would you like to do?) */}
      <div className="w-full space-y-4">
        <div className="text-center">
          <h2 className="text-xs uppercase tracking-[0.25em] text-gold font-bold font-serif mb-1">
            Digital Graduation Companion Guide
          </h2>
          <p className="text-gray-300 text-xs font-sans">Select what you would like to do on our website:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: Leave a Message */}
          <Link
            href="/messages"
            className="glass-card glass-card-hover rounded-2xl p-5 border-crimson/40 bg-gradient-to-b from-crimson/10 via-[#071120] to-[#071120] flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-crimson-gradient text-white shadow-md">
                  <Heart className="h-5 w-5" />
                </div>
                <span className="text-[9px] bg-crimson/20 text-red-300 border border-crimson/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Popular
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm text-white group-hover:text-gold transition-colors mb-1">
                Leave a Congratulatory Message
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed font-sans">
                Write a public congratulatory message to any graduate or to the whole class!
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-bold text-red-300 group-hover:text-gold flex items-center justify-between">
              <span>Write Message Now</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2: Certificate Order */}
          <Link
            href="/certificate-order"
            className="glass-card glass-card-hover rounded-2xl p-5 border-gold/40 bg-gradient-to-b from-gold/10 via-[#071120] to-[#071120] flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-gold-gradient text-navy-dark shadow-md">
                  <Trophy className="h-5 w-5" />
                </div>
                <span className="text-[9px] bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Stage Walk
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm text-gold-light group-hover:text-gold transition-colors mb-1">
                Certificate Distribution Order
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed font-sans">
                Find students in order of Highest Honors (#001–#010) and alphabetical walk order (#011–#059).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gold/10 text-[11px] font-bold text-gold flex items-center justify-between">
              <span>Check Stage Order</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3: Graduate Profiles */}
          <Link
            href="/graduates"
            className="glass-card glass-card-hover rounded-2xl p-5 border-gold/30 flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/30">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-serif font-bold text-sm text-gold-light group-hover:text-gold transition-colors mb-1">
                Graduate Profiles
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed font-sans">
                Search all 59 class members, view their social links, honors, and messages.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gold/10 text-[11px] font-bold text-gold flex items-center justify-between">
              <span>Browse Profiles</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 4: Photo & Video Hub */}
          <Link
            href="/media"
            className="glass-card glass-card-hover rounded-2xl p-5 border-gold/30 flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/30">
                  <ImageIcon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-serif font-bold text-sm text-gold-light group-hover:text-gold transition-colors mb-1">
                Photo & Video Hub
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed font-sans">
                Upload your ceremony photos or watch full ceremony videos & official photo albums.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gold/10 text-[11px] font-bold text-gold flex items-center justify-between">
              <span>Open Media Gallery</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 5: Achievements & Journey */}
          <Link
            href="/journey"
            className="glass-card glass-card-hover rounded-2xl p-5 border-blue-500/30 flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-serif font-bold text-sm text-blue-200 group-hover:text-blue-300 transition-colors mb-1">
                Class Achievements & Journey
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed font-sans">
                Explore scholarships, Master 2 admissions in France, and our 4-year class timeline.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-500/20 text-[11px] font-bold text-blue-300 flex items-center justify-between">
              <span>View Achievements</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 6: Ceremony Program */}
          <Link
            href="/program"
            className="glass-card glass-card-hover rounded-2xl p-5 border-gold/30 flex flex-col justify-between group transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-gold/10 text-gold border border-gold/30">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>
              <h3 className="font-serif font-bold text-sm text-gold-light group-hover:text-gold transition-colors mb-1">
                Ceremony Schedule & Program
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed font-sans">
                View the timeline of events from guest arrival to graduation closing remarks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gold/10 text-[11px] font-bold text-gold flex items-center justify-between">
              <span>View Event Schedule</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
