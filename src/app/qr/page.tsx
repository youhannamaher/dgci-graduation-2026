'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Download, Printer, Copy, Check, ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function QrPage() {
  const { ceremonyInfo } = useData();
  const [currentUrl, setCurrentUrl] = useState('https://dgci-graduation-2026.vercel.app');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 w-full text-center animate-fadeIn print:bg-white print:text-black">
      {/* Printable Poster Container */}
      <div className="glass-card rounded-2xl p-8 border-gold/30 gold-glow bg-gradient-to-b from-[#050B14] to-[#03070d] print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
        
        {/* Header */}
        <div className="flex justify-center items-center gap-2 mb-2">
          <GraduationCap className="h-6 w-6 text-gold print:text-black" />
          <span className="font-serif font-bold text-sm tracking-widest text-gold-light print:text-black">
            DGCI CLASS OF 2026
          </span>
        </div>

        <h1 className="text-xl font-serif font-extrabold text-gold tracking-wide mb-1 print:text-black">
          Digital Graduation Companion
        </h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6 print:text-gray-600">
          Scan QR Code to Join
        </p>

        {/* QR Code SVG Image */}
        <div className="bg-white p-6 rounded-2xl border-2 border-gold/40 inline-block shadow-xl mb-6 print:border-black print:shadow-none">
          {/* Custom vector representation of a luxury QR code */}
          <svg className="w-48 h-48 mx-auto" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h7v7H0V0zm2 2v3h3V2H2zm12 0h1v1h-1V2zm1 1h1v1h-1V3zm-1 2h1v1h-1V5zm1 1h1v1h-1V6zm7-6h7v7h-7V0zm2 2v3h3V2h-3zM0 14h7v7H0v-7zm2 2v3h3v-3H2zm20-2h7v7h-7v-7zm2 2v3h3v-3h-3z" fill="#050B14"/>
            <path d="M9 1h1v2H9V1zm1 4h1v2h-1V5zm1-4h1v1h-1V1zm3 1h1v2h-1V2zm-2 7h1v1h-1V9zm3 0h1v1h-1V9zm6 1h1v1h-1v-1zm4 0h1v1h-1v-1zm-2 2h1v1h-1v-1zm2 1h1v1h-1v-1zm-7 4h1v2h-1v-2zm1 3h1v1h-1v-1zm-5-3h1v1h-1v-1zm3 0h1v1h-1v-1zm1 1h1v1h-1v-1zm3 2h1v2h-1v-2zm-5 2h1v1h-1v-1zm6 1h1v1h-1v-1zm-10-8h1v1h-1v-1zm1 2h1v1h-1v-1zm-3-1h1v1h-1v-1zm5 3h1v1h-1v-1zm-3 1h1v1h-1v-1zm-2-5h1v1h-1v-1zm4-3h1v1h-1V9zm2 3h1v1h-1v-1z" fill="#050B14"/>
            <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" fill="#D4AF37" />
            <path d="M13.5 13.5l1.5-1 1.5 1-1.5 2z" fill="#050B14" />
          </svg>
        </div>

        {/* URL Display */}
        <div className="bg-[#03070d]/60 border border-gold/15 rounded-xl py-2 px-3 mb-6 inline-flex items-center gap-2 max-w-xs mx-auto print:hidden">
          <span className="text-[10px] font-mono text-gray-300 truncate w-48">
            {currentUrl}
          </span>
          <button
            onClick={handleCopyLink}
            className="p-1 hover:text-gold text-gray-500 transition-colors"
            title="Copy URL"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        <p className="text-xs text-gray-400 max-w-xs mx-auto font-sans leading-relaxed print:text-black">
          Access the Ceremony Program, Certificate distribution walking order, and upload guest photos live from your seat.
        </p>
      </div>

      {/* Action buttons (hidden in print) */}
      <div className="flex justify-center gap-3 mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 bg-[#03070d] text-gold border border-gold/30 px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:border-gold hover:bg-gold/5"
        >
          <Printer className="h-4 w-4" /> Print Poster
        </button>

        {/* SVG Download Link */}
        <a
          href={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" width="400" height="400" fill="white"><rect width="29" height="29" fill="white"/><path d="M0 0h7v7H0V0zm2 2v3h3V2H2zm12 0h1v1h-1V2zm1 1h1v1h-1V3zm-1 2h1v1h-1V5zm1 1h1v1h-1V6zm7-6h7v7h-7V0zm2 2v3h3V2h-3zM0 14h7v7H0v-7zm2 2v3h3v-3H2zm20-2h7v7h-7v-7zm2 2v3h3v-3h-3zM9 1h1v2H9V1zm1 4h1v2h-1V5zm1-4h1v1h-1V1zm3 1h1v2h-1V2zm-2 7h1v1h-1V9zm3 0h1v1h-1V9zm6 1h1v1h-1v-1zm4 0h1v1h-1v-1zm-2 2h1v1h-1v-1zm2 1h1v1h-1v-1zm-7 4h1v2h-1v-2zm1 3h1v1h-1v-1zm-5-3h1v1h-1v-1zm3 0h1v1h-1v-1zm1 1h1v1h-1v-1zm3 2h1v2h-1v-2zm-5 2h1v1h-1v-1zm6 1h1v1h-1v-1zm-10-8h1v1h-1v-1zm1 2h1v1h-1v-1zm-3-1h1v1h-1v-1zm5 3h1v1h-1v-1zm-3 1h1v1h-1v-1zm-2-5h1v1h-1v-1zm4-3h1v1h-1V9zm2 3h1v1h-1v-1z" fill="black"/></svg>`}
          download="dgci_graduation_qr.svg"
          className="inline-flex items-center gap-1.5 bg-gold-gradient text-navy-dark px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:bg-gold-gradient-hover active:scale-95"
        >
          <Download className="h-4 w-4" /> Download SVG
        </a>
      </div>

      {/* Instructions */}
      <div className="glass-card rounded-2xl p-6 border-gold/10 mt-8 text-left text-xs text-gray-400 font-sans leading-relaxed print:hidden">
        <span className="font-bold text-gold uppercase block mb-1.5 font-serif">Setup Instructions</span>
        <ul className="list-disc pl-4 space-y-1.5">
          <li><strong>Digital Display:</strong> Project this page or download the SVG and show it on stage/projector screens before the ceremony starts.</li>
          <li><strong>Physical Print:</strong> Print this QR page using the <strong className="text-gold">Print Poster</strong> button and place signs at guest arrival seating or tables.</li>
          <li><strong>Invitation Print:</strong> Embed the downloaded SVG on WhatsApp invitations or print it on paper invitations.</li>
        </ul>
      </div>
    </div>
  );
}
