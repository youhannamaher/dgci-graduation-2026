'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { StudentAvatar } from '@/components/StudentAvatar';
import { Search, MessageSquare, User, HelpCircle, ArrowUpDown } from 'lucide-react';

const ITEMS_PER_PAGE = 30;

export default function CertificateOrderPage() {
  const { graduates, isLoading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Filtered and sorted graduates
  const filteredGraduates = useMemo(() => {
    const sorted = [...graduates].sort((a, b) => a.order - b.order);
    if (!searchQuery.trim()) return sorted;
    
    const query = searchQuery.toLowerCase().trim();
    return sorted.filter(
      (g) =>
        g.fullName.toLowerCase().includes(query) ||
        g.displayName.toLowerCase().includes(query) ||
        `#${String(g.order).padStart(3, '0')}`.includes(query)
    );
  }, [graduates, searchQuery]);

  // Handle Load More
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Reset pagination when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const displayedGraduates = useMemo(() => {
    return filteredGraduates.slice(0, visibleCount);
  }, [filteredGraduates, visibleCount]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full animate-fadeIn">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-2">
          Certificate Distribution Order
        </h1>
        <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
          Search for graduates to see their official stage walk order, view their profile, or leave a congratulatory message.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gold/60" />
        </div>
        <input
          type="text"
          placeholder="Search by name or order #..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="block w-full pl-10 pr-4 py-3 bg-[#03070d]/50 border border-gold/25 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all duration-300"
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

      {/* Graduation List */}
      {filteredGraduates.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center border-gold/10">
          <HelpCircle className="h-8 w-8 text-gold mx-auto mb-2 opacity-60" />
          <p className="text-gray-400 text-sm">No graduates match your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedGraduates.map((grad) => (
            <div
              key={grad.id}
              className="glass-card rounded-xl p-3 border border-gold/10 hover:border-gold/30 transition-all duration-300 flex items-center justify-between gap-3 text-left"
            >
              {/* Left Section: Photo and Name */}
              <div className="flex items-center gap-3">
                {/* Order Index */}
                <div className="w-10 text-center font-serif text-xs font-bold text-gold">
                  #{String(grad.order).padStart(3, '0')}
                </div>
                
                {/* Avatar */}
                <StudentAvatar fullName={grad.fullName} photoUrl={grad.photo} size="sm" />

                {/* Name */}
                <div>
                  <h3 className="font-serif font-bold text-xs md:text-sm text-gold-light leading-snug">
                    {grad.fullName}
                  </h3>
                  <span className="text-[10px] text-gray-500 font-sans">
                    {grad.displayName}
                  </span>
                </div>
              </div>

              {/* Right Section: Action Buttons */}
              <div className="flex gap-2">
                <Link
                  href={`/graduates/${grad.id}`}
                  className="p-1.5 rounded-lg bg-gold/5 border border-gold/20 text-gold hover:bg-gold hover:text-navy-dark transition-all duration-200"
                  title="View Profile"
                >
                  <User className="h-4 w-4" />
                </Link>
                <Link
                  href={`/messages?to=${grad.id}`}
                  className="p-1.5 rounded-lg bg-gold/5 border border-gold/20 text-gold hover:bg-gold hover:text-navy-dark transition-all duration-200"
                  title="Leave Message"
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {filteredGraduates.length > visibleCount && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-[#03070d] border border-gold/30 hover:border-gold text-gold rounded-full text-xs font-semibold tracking-wider hover:bg-gold/5 active:scale-95 transition-all"
          >
            Load More Graduates
          </button>
        </div>
      )}

      {/* Helper Details */}
      <div className="text-center text-[10px] text-gray-500 mt-8 font-sans">
        Showing {Math.min(visibleCount, filteredGraduates.length)} of {filteredGraduates.length} graduates
      </div>
    </div>
  );
}
