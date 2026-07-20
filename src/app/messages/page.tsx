'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/context/DataContext';
import { MessageSquare, Send, CheckCircle2, User, Users, AlertTriangle } from 'lucide-react';

const RELATION_OPTIONS = ['Friend', 'Family', 'Professor', 'Guest', 'Graduate'];

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetFromUrl = searchParams.get('to') || '';

  const { graduates, messages, submitMessage, isLoading } = useData();

  // Form State
  const [targetType, setTargetType] = useState<'class' | 'graduate'>('class');
  const [selectedGraduateId, setSelectedGraduateId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [relation, setRelation] = useState('Guest');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Status State
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle URL deep linking
  useEffect(() => {
    if (targetFromUrl) {
      setTargetType('graduate');
      setSelectedGraduateId(targetFromUrl);
    }
  }, [targetFromUrl]);

  // Approved class-wide messages
  const classMessages = useMemo(() => {
    return messages.filter((m) => m.status === 'approved' && m.targetType === 'class');
  }, [messages]);

  // Clean HTML script tags helper
  const sanitizeInput = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setErrorMessage('');

    // Client-side spam rate limit check
    const lastSubmit = localStorage.getItem('dgci_last_msg_submit');
    const now = Date.now();
    if (lastSubmit && now - parseInt(lastSubmit) < 20000) {
      setSubmitStatus('error');
      setErrorMessage('Please wait 20 seconds between leaving messages.');
      return;
    }

    // Validations
    if (!messageText.trim()) {
      setSubmitStatus('error');
      setErrorMessage('Message text cannot be empty.');
      return;
    }
    if (messageText.length > 500) {
      setSubmitStatus('error');
      setErrorMessage('Message cannot exceed 500 characters.');
      return;
    }
    if (targetType === 'graduate' && !selectedGraduateId) {
      setSubmitStatus('error');
      setErrorMessage('Please select a graduate.');
      return;
    }

    const sanitizedMessage = sanitizeInput(messageText.trim());
    const finalSenderName = isAnonymous ? 'Anonymous' : (senderName.trim() || 'Anonymous');

    const success = await submitMessage({
      message: sanitizedMessage,
      senderName: finalSenderName,
      isAnonymous,
      targetType,
      targetGraduateIds: targetType === 'graduate' ? [selectedGraduateId] : [],
      relation
    });

    if (success) {
      setSubmitStatus('success');
      setMessageText('');
      setSenderName('');
      setIsAnonymous(false);
      localStorage.setItem('dgci_last_msg_submit', String(now));
      
      // Reset success status after a delay
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } else {
      setSubmitStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full animate-fadeIn grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column: Form */}
      <div>
        <div className="glass-card rounded-2xl p-6 border-gold/20 gold-glow sticky top-24">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-serif font-bold text-gold-light">Congratulate Graduates</h2>
          </div>

          <p className="text-gray-400 text-xs mb-5 leading-relaxed font-sans">
            Write a memory or a congratulations note. All submissions are moderated and will appear publicly once approved by the administrator.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target Type */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                Who is this message for?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('class')}
                  className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    targetType === 'class'
                      ? 'bg-gold-gradient text-navy-dark border-gold'
                      : 'bg-[#03070d]/30 border-gold/15 text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" /> Whole Class
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('graduate')}
                  className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    targetType === 'graduate'
                      ? 'bg-gold-gradient text-navy-dark border-gold'
                      : 'bg-[#03070d]/30 border-gold/15 text-gray-300 hover:border-gold/30'
                  }`}
                >
                  <User className="h-3.5 w-3.5" /> Specific Graduate
                </button>
              </div>
            </div>

            {/* Graduate Selector */}
            {targetType === 'graduate' && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">
                  Select Graduate
                </label>
                <select
                  value={selectedGraduateId}
                  onChange={(e) => setSelectedGraduateId(e.target.value)}
                  className="block w-full bg-[#03070d]/70 border border-gold/25 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                >
                  <option value="">-- Choose a graduate --</option>
                  {[...graduates]
                    .sort((a, b) => a.fullName.localeCompare(b.fullName))
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.fullName} (#{String(g.order).padStart(3, '0')})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Message Body */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">
                Message (Max 500 characters)
              </label>
              <textarea
                rows={4}
                maxLength={500}
                placeholder="Congratulations..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="block w-full bg-[#03070d]/70 border border-gold/25 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold"
                required
              />
              <div className="text-right text-[9px] text-gray-500 mt-1">
                {messageText.length}/500 chars
              </div>
            </div>

            {/* Sender Name */}
            {!isAnonymous && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="block w-full bg-[#03070d]/70 border border-gold/25 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gold"
                  required={!isAnonymous}
                />
              </div>
            )}

            {/* Relation Options */}
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">
                Your Relation
              </label>
              <div className="flex flex-wrap gap-1.5">
                {RELATION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRelation(opt)}
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                      relation === opt
                        ? 'bg-gold/15 text-gold border-gold'
                        : 'bg-[#03070d]/30 border-gold/10 text-gray-400 hover:border-gold/20'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-gold/30 text-gold bg-[#03070d] focus:ring-gold focus:ring-0 cursor-pointer"
              />
              <label htmlFor="isAnonymous" className="text-xs text-gray-300 select-none cursor-pointer">
                Submit anonymously
              </label>
            </div>

            {/* Message Status Displays */}
            {submitStatus === 'success' && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Message submitted for approval! Thank you.</span>
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitStatus === 'loading'}
              className="w-full bg-gold-gradient text-navy-dark py-2.5 rounded-xl text-xs font-bold tracking-wider hover:bg-gold-gradient-hover active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
            >
              {submitStatus === 'loading' ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Submit Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Class Messages Board */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base uppercase tracking-[0.15em] text-gold font-bold font-serif">
            Class of 2026 Board
          </h2>
          <span className="text-[10px] text-gray-500 font-semibold bg-[#03070d] px-2 py-0.5 rounded border border-gold/15">
            {classMessages.length} Messages
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gold"></div>
          </div>
        ) : classMessages.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border-gold/10 text-gray-500 text-xs">
            <p>No messages left for the whole class yet. Write yours on the left!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {classMessages.map((msg) => (
              <div
                key={msg.id}
                className="glass-card rounded-2xl p-4 border border-gold/10 hover:border-gold/25 transition-all text-left"
              >
                <p className="text-xs text-gray-200 leading-relaxed font-sans mb-3 whitespace-pre-line">
                  &ldquo;{msg.message}&rdquo;
                </p>
                <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-gold/5 pt-2 font-sans">
                  <div>
                    <span className="font-semibold text-gold-light">
                      {msg.isAnonymous ? 'Anonymous' : msg.senderName}
                    </span>
                    {msg.relation && (
                      <span className="ml-1 bg-gold/10 text-gold px-1.5 py-0.5 rounded text-[8px]">
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

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
