'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X, GraduationCap, Calendar, Award, MessageSquare, Image as ImageIcon, Users, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: GraduationCap },
    { name: 'Program', path: '/program', icon: Calendar },
    { name: 'Certificate Order', path: '/certificate-order', icon: Award },
    { name: 'Graduates', path: '/graduates', icon: Users },
    { name: 'Messages & Memories', path: '/messages', icon: MessageSquare },
    { name: 'Media Hub', path: '/media', icon: ImageIcon },
    { name: 'Our Journey', path: '/journey', icon: BookOpen }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-gold/20 bg-[#050B14]/90 backdrop-blur-md">
      {/* Logos Bar */}
      <div className="border-b border-gold/10 bg-[#03070d]/60 py-2 px-4 flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-3 md:gap-5 w-full justify-around">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-gold-light/60 mb-0.5">IAE Poitiers</span>
            <div className="relative w-12 h-6 flex items-center justify-center bg-gold/10 rounded px-1 border border-gold/20">
              <span className="text-[10px] font-bold text-gold">IAE</span>
            </div>
          </div>
          
          <div className="h-6 w-[1px] bg-gold/20"></div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-gold-light/60 mb-0.5">DGCI</span>
            <div className="relative w-14 h-7 flex items-center justify-center bg-gold-gradient rounded px-1 shadow-[0_0_8px_rgba(212,175,55,0.3)]">
              <span className="text-xs font-serif font-extrabold text-[#050B14]">DGCI</span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-gold/20"></div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[9px] uppercase tracking-widest text-gold-light/60 mb-0.5">Ain Shams</span>
            <div className="relative w-12 h-6 flex items-center justify-center bg-gold/10 rounded px-1 border border-gold/20">
              <span className="text-[9px] font-bold text-gold">ASU</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav Items */}
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Title */}
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-gold" />
          <span className="font-serif font-bold text-sm md:text-base tracking-wider text-gold-light">
            DGCI 2026
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${
                  Active
                    ? 'bg-gold-gradient text-navy-dark shadow-[0_0_10px_rgba(212,175,55,0.25)] font-bold'
                    : 'text-gray-300 hover:text-gold hover:bg-gold/5'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-1.5 rounded-md text-gold hover:bg-gold/10 transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="lg:hidden border-t border-gold/10 bg-[#050B14]/95 animate-fadeIn">
          <nav className="flex flex-col px-3 py-3 space-y-1">
            {navItems.map((item) => {
              const Active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                    Active
                      ? 'bg-gold-gradient text-navy-dark font-semibold shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                      : 'text-gray-300 hover:text-gold hover:bg-gold/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
