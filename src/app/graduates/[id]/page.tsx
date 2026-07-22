'use client';

import React, { use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { StudentAvatar } from '@/components/StudentAvatar';
import { FranceFlag } from '@/components/FranceFlag';
import { ArrowLeft, MessageSquare, Quote, Calendar, AlertTriangle, Trophy, Sparkles, Award } from 'lucide-react';


interface ProfileParams {
  params: Promise<{ id: string }>;
}

export default function GraduateProfilePage({ params }: ProfileParams) {
  const router = useRouter();
  
  // React 19 / Next.js dynamic params resolution
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { graduates, messages, isLoading } = useData();

  // Find the graduate
  const graduate = useMemo(() => {
    return graduates.find((g) => g.id === id);
  }, [graduates, id]);

  // Find approved messages targetting this graduate
  const graduateMessages = useMemo(() => {
    return messages.filter(
      (m) =>
        m.status === 'approved' &&
        m.targetType === 'graduate' &&
        m.targetGraduateIds.includes(id)
    );
  }, [messages, id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  // Handle case where graduate is not found or has showProfile = false
  if (!graduate || !graduate.showProfile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fadeIn">
        <div className="glass-card rounded-2xl p-8 border-gold/25">
          <AlertTriangle className="h-12 w-12 text-gold mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-gold-light mb-2">Graduate Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">
            The profile you are looking for does not exist or has been hidden.
          </p>
          <Link
            href="/graduates"
            className="inline-flex items-center gap-1.5 bg-gold-gradient text-navy-dark px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:bg-gold-gradient-hover"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Graduates
          </Link>
        </div>
      </div>
    );
  }

  const hasSocials = graduate.linkedin || graduate.instagram;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full animate-fadeIn">
      {/* Back link */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
      </div>

      {/* Profile Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 border-gold/25 mb-8 text-center relative gold-glow">
        {/* Certificate Order Badge */}
        <div className="absolute top-4 right-4 bg-gold/10 text-gold border border-gold/30 px-3 py-1 rounded-full text-xs font-serif font-bold">
          Order Walk #{String(graduate.order).padStart(3, '0')}
        </div>

        {/* Large Avatar */}
        <div className="flex justify-center mb-5">
          <StudentAvatar fullName={graduate.fullName} photoUrl={graduate.photo} size="xl" className="shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-2 border-gold/30" />
        </div>

        {/* Name details */}
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-1">
          {graduate.fullName}
        </h1>
        <p className="text-gray-500 text-xs md:text-sm font-sans mb-3">
          Known as &ldquo;{graduate.displayName}&rdquo;
        </p>

        {/* Academic Honors & Badges */}
        {(graduate.isHighestHonors === true || (typeof graduate.honorsOrder === 'number' && graduate.honorsOrder > 0) || graduate.bourse || graduate.masterProgram) && (
          <div className="flex flex-wrap justify-center gap-2 my-4">
            {(graduate.isHighestHonors === true || (typeof graduate.honorsOrder === 'number' && graduate.honorsOrder > 0)) && (
              <div className="bg-gold-gradient text-navy-dark px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                <Trophy className="h-3.5 w-3.5" /> Highest Honors
              </div>
            )}
            {graduate.bourse && (
              <div className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                📜 {graduate.bourse}
              </div>
            )}
            {graduate.masterProgram && (
              <div className="bg-blue-950/80 text-blue-200 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                <FranceFlag className="w-3.5 h-2.5" /> {graduate.masterProgram}
              </div>
            )}
          </div>
        )}



        {/* Social Links & Action Button */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 border-t border-gold/10 pt-6">
          {hasSocials && (
            <div className="flex gap-3">
              {graduate.linkedin && (
                <a
                  href={graduate.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gold/10 border border-gold/25 text-gold hover:bg-gold hover:text-navy-dark transition-all duration-200"
                  title="LinkedIn Profile"
                >
                  <svg className="h-4.5 w-4.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
              {graduate.instagram && (
                <a
                  href={graduate.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-gold/10 border border-gold/25 text-gold hover:bg-gold hover:text-navy-dark transition-all duration-200"
                  title="Instagram Profile"
                >
                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              )}
            </div>
          )}

          <Link
            href={`/messages?to=${graduate.id}`}
            className="w-full sm:w-auto bg-gold-gradient text-navy-dark px-6 py-2.5 rounded-full text-xs font-bold tracking-wider hover:bg-gold-gradient-hover transition-all duration-200 flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
          >
            <MessageSquare className="h-4.5 w-4.5" /> Leave Message
          </Link>
        </div>
      </div>

      {/* Messages Wall Section */}
      <div>
        <h2 className="text-base uppercase tracking-[0.15em] text-gold font-bold mb-4 font-serif">
          Congratulations Messages
        </h2>

        {graduateMessages.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center border-gold/10 text-gray-500 text-xs">
            <p>No messages left for {graduate.displayName} yet.</p>
            <Link href={`/messages?to=${graduate.id}`} className="text-gold hover:underline mt-1 inline-block font-semibold">
              Be the first to congratulate them!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {graduateMessages.map((msg) => (
              <div
                key={msg.id}
                className="glass-card rounded-xl p-4 border border-gold/10 text-left relative"
              >
                <p className="text-xs text-gray-200 leading-relaxed font-sans mb-3 whitespace-pre-line">
                  &ldquo;{msg.message}&rdquo;
                </p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-gold/5 pt-2">
                  <div>
                    <span className="font-semibold text-gold-light">
                      {msg.isAnonymous ? 'Anonymous' : msg.senderName}
                    </span>
                    {msg.relation && (
                      <span className="ml-1 bg-gold/10 text-gold px-1 py-0.5 rounded text-[8px]">
                        {msg.relation}
                      </span>
                    )}
                  </div>
                  <span>
                    {new Date(msg.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
