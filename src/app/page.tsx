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

  // Exact 6 action items in exact requested order
  const actionItems = [
    {
      name: 'Program',
      desc: 'Schedule & event timeline',
      path: '/program',
      icon: CalendarDays,
      badge: 'Schedule'
    },
    {
      name: 'Certificate distribution order',
      desc: 'Stage walk order & honors',
      path: '/certificate-order',
      icon: Award,
      badge: 'Stage Order'
    },
    {
      name: 'Messages',
      desc: 'Leave a congratulatory message',
      path: '/messages',
      icon: MessageSquare,
      badge: 'Congratulate'
    },
    {
      name: 'Photos',
      desc: 'Upload & view ceremony media',
      path: '/media',
      icon: ImageIcon,
      badge: 'Gallery'
    },
    {
      name: 'Graduates',
      desc: 'Browse graduate profiles & details',
      path: '/graduates',
      icon: Users,
      badge: 'Class List'
    },
    {
      name: 'Achievements',
      desc: 'Scholarships & M2 in France',
      path: '/journey',
      icon: BookOpen,
      badge: 'Distinctions'
    },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 max-w-4xl mx-auto w-full space-y-8 animate-fadeIn">
      {/* Class Heading Header */}
      <div className="text-center">
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-gold font-bold mb-1.5 font-serif">
          Class of {ceremonyInfo.classYear} Graduation
        </h2>
        <h1 className="text-2xl md:text-4xl font-serif font-extrabold text-gold-light tracking-wide mb-2">
          {ceremonyInfo.title}
        </h1>
        <p className="text-gray-400 font-sans text-xs md:text-sm max-w-md mx-auto leading-relaxed">
          {ceremonyInfo.subtitle}
        </p>
      </div>

      {/* TOP PRIORITY: 6 Navigation Action Cards (2 BY 2 ON MOBILE, 3 BY 2 ON DESKTOP) */}
      <div className="w-full">
        <h3 className="text-[10px] uppercase tracking-[0.25em] text-gold text-center font-bold mb-4 font-serif">
          Quick Navigation & Actions
        </h3>

        {/* 2 Columns on Mobile (grid-cols-2), 3 Columns on Desktop (lg:grid-cols-3) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {actionItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.path}
                className="glass-card glass-card-hover rounded-2xl p-3.5 md:p-5 border border-gold/20 text-left flex flex-col justify-between transition-all duration-300 group gold-glow-hover relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="bg-gold/10 p-2 rounded-xl text-gold group-hover:bg-gold-gradient group-hover:text-navy-dark transition-all duration-300">
                      <Icon className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <span className="text-[9px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full font-serif font-semibold">
                      {item.badge}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-xs md:text-sm text-gold-light group-hover:text-gold transition-colors duration-200 line-clamp-1 mb-1">
                    {item.name}
                  </h4>
                  <p className="text-gray-400 text-[10px] md:text-xs leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gold/10 text-[10px] md:text-[11px] font-bold text-gold flex items-center justify-between group-hover:translate-x-0.5 transition-all">
                  <span>Open</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SECONDARY PRIORITY: Countdown & Ceremony Event Details */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Countdown Timer */}
        <div className="glass-card rounded-2xl p-5 text-center border-gold/30 gold-glow flex flex-col justify-center">
          {timeLeft.isOver ? (
            <div className="py-2">
              <span className="inline-block bg-gold-gradient text-navy-dark px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
                Ceremony Live
              </span>
              <h3 className="text-lg font-serif font-semibold text-gold-light">The Celebration Has Commenced</h3>
            </div>
          ) : (
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-light/70 font-semibold block mb-2.5 font-serif">
                COUNTDOWN TO CEREMONY
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#03070d]/60 rounded-xl p-2 border border-gold/15">
                  <span className="block text-xl md:text-2xl font-serif text-gold-light font-bold">
                    {timeLeft.days}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-semibold">Days</span>
                </div>
                <div className="bg-[#03070d]/60 rounded-xl p-2 border border-gold/15">
                  <span className="block text-xl md:text-2xl font-serif text-gold-light font-bold">
                    {timeLeft.hours}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-semibold">Hrs</span>
                </div>
                <div className="bg-[#03070d]/60 rounded-xl p-2 border border-gold/15">
                  <span className="block text-xl md:text-2xl font-serif text-gold-light font-bold">
                    {timeLeft.minutes}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-semibold">Min</span>
                </div>
                <div className="bg-[#03070d]/60 rounded-xl p-2 border border-gold/15">
                  <span className="block text-xl md:text-2xl font-serif text-gold-light font-bold">
                    {timeLeft.seconds}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-gray-400 font-semibold">Sec</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ceremony Event Info */}
        <div className="glass-card rounded-2xl p-5 border-gold/20 flex flex-col justify-between space-y-3">
          <div className="space-y-2 font-sans">
            <span className="text-[10px] uppercase tracking-[0.2em] text-gold-light/70 font-semibold block mb-2 font-serif">
              CEREMONY LOCATION
            </span>
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
              <Calendar className="h-4 w-4 text-gold shrink-0" />
              <span>{ceremonyInfo.date}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
              <Clock className="h-4 w-4 text-gold shrink-0" />
              <span>{ceremonyInfo.time}</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-300">
              <MapPin className="h-4 w-4 text-gold shrink-0" />
              <span className="line-clamp-1">{ceremonyInfo.venue}</span>
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
    </div>
  );
}
