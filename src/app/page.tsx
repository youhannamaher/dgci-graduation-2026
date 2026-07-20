'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { Calendar, Clock, MapPin, CalendarDays, ArrowRight, Award, MessageSquare, Image as ImageIcon, Users, BookOpen } from 'lucide-react';

export default function HomePage() {
  const { ceremonyInfo } = useData();
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

  const actionItems = [
    { name: 'Ceremony Program', desc: 'Schedule & timeline of events', path: '/program', icon: CalendarDays, border: 'border-gold/20 hover:border-gold/60' },
    { name: 'Certificate Order', desc: 'Find students certificate order', path: '/certificate-order', icon: Award, border: 'border-gold/20 hover:border-gold/60' },
    { name: 'Graduate Wall', desc: 'Browse graduates and quotes', path: '/graduates', icon: Users, border: 'border-gold/20 hover:border-gold/60' },
    { name: 'Messages & Memories', desc: 'Congratulate the graduates', path: '/messages', icon: MessageSquare, border: 'border-gold/20 hover:border-gold/60' },
    { name: 'Photo & Video Hub', desc: 'Upload and view ceremony media', path: '/media', icon: ImageIcon, border: 'border-gold/20 hover:border-gold/60' },
    { name: 'Class Journey', desc: '2022 - 2026 milestones timeline', path: '/journey', icon: BookOpen, border: 'border-gold/20 hover:border-gold/60' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto w-full">
      {/* Welcome Heading */}
      <div className="text-center mb-8 animate-fadeIn">
        <h2 className="text-xs uppercase tracking-[0.25em] text-gold font-bold mb-2">Class of {ceremonyInfo.classYear}</h2>
        <h1 className="text-3xl md:text-5xl font-serif font-extrabold text-gold-light tracking-wide mb-3 px-2">
          {ceremonyInfo.title}
        </h1>
        <p className="text-gray-400 font-sans text-xs md:text-sm max-w-lg mx-auto leading-relaxed mt-1 px-4">
          {ceremonyInfo.subtitle}
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="w-full max-w-md glass-card rounded-2xl p-6 mb-8 text-center border-gold/30 gold-glow">
        {timeLeft.isOver ? (
          <div className="py-2">
            <span className="inline-block bg-gold-gradient text-navy-dark px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              Ceremony Live
            </span>
            <h3 className="text-xl font-serif font-semibold text-gold-light">The Celebration Has Commenced</h3>
          </div>
        ) : (
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold-light/60 font-semibold block mb-3">
              COUNTDOWN TO CEREMONY
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#03070d]/50 rounded-xl p-2.5 border border-gold/10">
                <span className="block text-2xl md:text-3xl font-serif text-gold-light font-bold">
                  {timeLeft.days}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gray-500">Days</span>
              </div>
              <div className="bg-[#03070d]/50 rounded-xl p-2.5 border border-gold/10">
                <span className="block text-2xl md:text-3xl font-serif text-gold-light font-bold">
                  {timeLeft.hours}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gray-500">Hrs</span>
              </div>
              <div className="bg-[#03070d]/50 rounded-xl p-2.5 border border-gold/10">
                <span className="block text-2xl md:text-3xl font-serif text-gold-light font-bold">
                  {timeLeft.minutes}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gray-500">Min</span>
              </div>
              <div className="bg-[#03070d]/50 rounded-xl p-2.5 border border-gold/10">
                <span className="block text-2xl md:text-3xl font-serif text-gold-light font-bold">
                  {timeLeft.seconds}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-gray-500">Sec</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ceremony Details Card */}
      <div className="w-full max-w-lg glass-card rounded-2xl p-6 mb-10 border-gold/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="w-full space-y-3.5">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Calendar className="h-4.5 w-4.5 text-gold flex-shrink-0" />
            <span>{ceremonyInfo.date}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Clock className="h-4.5 w-4.5 text-gold flex-shrink-0" />
            <span>{ceremonyInfo.time}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <MapPin className="h-4.5 w-4.5 text-gold flex-shrink-0" />
            <span>{ceremonyInfo.venue}</span>
          </div>
        </div>

        {ceremonyInfo.locationUrl && (
          <a
            href={ceremonyInfo.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full md:w-auto text-center bg-gold-gradient text-navy-dark px-5 py-2.5 rounded-full text-xs font-bold tracking-wider hover:bg-gold-gradient-hover active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
          >
            Open Location <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Quick Navigation Grid */}
      <div className="w-full">
        <h3 className="text-xs uppercase tracking-[0.2em] text-gold text-center font-bold mb-6">
          Digital Graduation Companion
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.path}
                className="glass-card glass-card-hover rounded-xl p-5 border text-left flex items-start gap-4 transition-all duration-300 group"
              >
                <div className="bg-gold/10 p-2 rounded-lg text-gold group-hover:bg-gold-gradient group-hover:text-navy-dark transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-serif font-semibold text-sm text-gold-light group-hover:text-gold transition-colors duration-200">
                    {item.name}
                  </h4>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
