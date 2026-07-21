'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { Camera, Image as ImageIcon, Video, ExternalLink, HelpCircle, Upload, CheckCircle2, AlertTriangle, Play, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react';

export default function MediaHubPage() {
  const { photos, mediaLinks, submitPhoto, isLoading } = useData();

  // Form State
  const [caption, setCaption] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status State
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadCount, setUploadCount] = useState(0);

  // Lightbox State
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Only show approved photos in public gallery
  const approvedPhotos = useMemo(() => {
    return photos.filter((p) => p.status === 'approved');
  }, [photos]);

  // Keyboard navigation & Esc key listener for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePhotoIndex === null) return;
      if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) => (prev !== null && prev < approvedPhotos.length - 1 ? prev + 1 : 0));
        setIsZoomed(false);
      } else if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : approvedPhotos.length - 1));
        setIsZoomed(false);
      } else if (e.key === 'Escape') {
        setActivePhotoIndex(null);
        setIsZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePhotoIndex, approvedPhotos.length]);

  // Touch Swipe handlers for mobile photo navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX || isZoomed) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe && activePhotoIndex !== null) {
      setActivePhotoIndex((prev) => (prev !== null && prev < approvedPhotos.length - 1 ? prev + 1 : 0));
      setIsZoomed(false);
    } else if (isRightSwipe && activePhotoIndex !== null) {
      setActivePhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : approvedPhotos.length - 1));
      setIsZoomed(false);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Client-side image compression (HD 1400px quality)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1400;
          const MAX_HEIGHT = 1400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.82 quality for high-definition sharpness
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setPreviewUrl(URL.createObjectURL(files[0]));
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    try {
      setUploadStatus('uploading');

      let successCount = 0;
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const base64Image = await compressImage(file);

        const ok = await submitPhoto({
          url: base64Image,
          caption: caption.trim() || (selectedFiles.length > 1 ? `Memory #${i + 1}` : ''),
          uploadedBy: uploadedBy.trim() || 'Anonymous'
        });

        if (ok) successCount++;
      }

      if (successCount > 0) {
        setUploadStatus('success');
        setCaption('');
        setSelectedFiles([]);
        setPreviewUrl(null);
        setUploadCount((prev) => prev + successCount);

        setTimeout(() => {
          setUploadStatus('idle');
        }, 5000);
      } else {
        setUploadStatus('error');
        setErrorMessage('Failed to upload photos. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setErrorMessage('Upload processing failed. Please choose another image.');
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : '';
  };

  const recapEmbed = useMemo(() => getYoutubeEmbedUrl(mediaLinks.recapVideoUrl), [mediaLinks.recapVideoUrl]);
  const fullEmbed = useMemo(() => getYoutubeEmbedUrl(mediaLinks.fullCeremonyUrl), [mediaLinks.fullCeremonyUrl]);

  const activePhoto = activePhotoIndex !== null ? approvedPhotos[activePhotoIndex] : null;

  return (
    <div className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full space-y-10">
      {/* Title */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-gold/10 border border-gold/30 mb-3 text-gold">
          <Camera className="h-6 w-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-1">
          Photo & Video Hub
        </h1>
        <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
          Upload your personal ceremony photos or download official media recordings.
        </p>
      </div>

      {/* Grid: Upload & Official Albums */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border-gold/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Upload className="h-5 w-5 text-gold" />
              <h2 className="text-base font-serif font-bold text-gold-light">Share Your Ceremony Photos</h2>
            </div>
            <p className="text-gray-400 text-xs mb-4 leading-relaxed font-sans">
              Select one or multiple photos from your phone or camera to feature in our graduate class memory album.
            </p>

            {uploadStatus === 'success' && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Uploaded successfully! Pending quick admin review.</span>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="mb-4 p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 font-sans">
              <div className="border-2 border-dashed border-gold/25 hover:border-gold/60 rounded-xl p-4 text-center cursor-pointer transition-all bg-[#03070d]/50 relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={previewUrl} alt="Preview" className="h-28 object-contain rounded-lg border border-gold/20 mb-2" />
                    <span className="text-[10px] text-gold font-medium">
                      {selectedFiles.length > 1 ? `${selectedFiles.length} photos selected (click to replace)` : 'Click to replace photo'}
                    </span>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gold/60 mb-2" />
                    <span className="text-xs text-gray-300 font-semibold">Select Photos from Library or Camera</span>
                    <span className="text-[9px] text-gray-500 mt-1">Select one or multiple photos (any size auto-compressed)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Caption (Optional)
                </label>
                <input
                  type="text"
                  placeholder="A great memory..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="block w-full bg-[#03070d]/70 border border-gold/25 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Anonymous"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  className="block w-full bg-[#03070d]/70 border border-gold/25 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <button
                type="submit"
                disabled={selectedFiles.length === 0 || uploadStatus === 'uploading'}
                className="w-full bg-gold-gradient text-navy-dark py-2.5 rounded-xl font-bold text-xs hover:bg-gold-gradient-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(212,175,55,0.2)]"
              >
                {uploadStatus === 'uploading' ? 'Uploading Selected Photos...' : selectedFiles.length > 1 ? `Upload ${selectedFiles.length} Photos` : 'Upload Photo'}
              </button>
            </form>
          </div>
          <div className="text-right text-[9px] text-gray-500 mt-2">
            Uploaded: {uploadCount} photos this session
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border-gold/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="h-5 w-5 text-gold" />
              <h2 className="text-base font-serif font-bold text-gold-light">Official Ceremony Photos</h2>
            </div>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed font-sans">
              High-resolution official photos captured by our professional photographers will be uploaded here shortly after the graduation ceremony concludes.
            </p>

            <div className="bg-[#03070d]/40 rounded-xl p-5 border border-gold/10 text-center py-8">
              <span className="text-xs text-gold font-serif block mb-2 font-semibold">
                Official Gallery Link
              </span>
              
              {mediaLinks.officialPhotosUrl && mediaLinks.officialPhotosUrl !== 'https://drive.google.com/drive/folders/placeholder-id' ? (
                <div className="space-y-4">
                  <p className="text-[11px] text-gray-300">
                    The official photos folder has been published! Click below to view and download all graduation snaps.
                  </p>
                  <a
                    href={mediaLinks.officialPhotosUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-gold-gradient text-navy-dark px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                  >
                    Open Google Drive Folder <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] text-gray-500 italic max-w-xs mx-auto">
                    &ldquo;Official photos will be uploaded here after the ceremony.&rdquo;
                  </p>
                  <span className="inline-block mt-4 text-[10px] text-gold/40 border border-gold/15 bg-gold/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-5 w-5 text-gold" />
          <h2 className="text-base uppercase tracking-[0.15em] text-gold font-bold font-serif">Ceremony Video Recordings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-5 border border-gold/15">
            <h3 className="text-xs uppercase tracking-wider text-gold-light font-semibold mb-3">Recap Video</h3>
            {recapEmbed ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gold/10">
                <iframe
                  src={recapEmbed}
                  title="Ceremony Recap Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            ) : (
              <div className="bg-[#03070d]/30 aspect-video rounded-xl border border-gold/10 flex flex-col items-center justify-center text-center p-4">
                <Play className="h-8 w-8 text-gold/30 mb-2" />
                <p className="text-[10px] text-gray-500 italic">&ldquo;Recap video coming soon&rdquo;</p>
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5 border border-gold/15">
            <h3 className="text-xs uppercase tracking-wider text-gold-light font-semibold mb-3">DGCI 2026 Video</h3>
            {fullEmbed ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gold/10">
                <iframe
                  src={fullEmbed}
                  title="DGCI 2026 Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            ) : (
              <div className="bg-[#03070d]/30 aspect-video rounded-xl border border-gold/10 flex flex-col items-center justify-center text-center p-4">
                <Play className="h-8 w-8 text-gold/30 mb-2" />
                <p className="text-[10px] text-gray-500 italic">&ldquo;DGCI 2026 video coming soon&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base uppercase tracking-[0.15em] text-gold font-bold font-serif">Guest Memories Gallery</h2>
          <span className="text-[10px] text-gray-500 bg-[#03070d] px-2 py-0.5 border border-gold/15 rounded font-semibold">
            {approvedPhotos.length} photos
          </span>
        </div>

        {approvedPhotos.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border-gold/15 text-gray-500 text-xs">
            <p>No guest photos uploaded yet. Be the first to share your memories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {approvedPhotos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => {
                  setActivePhotoIndex(index);
                  setIsZoomed(false);
                }}
                className="glass-card rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 cursor-pointer transition-all duration-300 group flex flex-col h-full"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-black/25 flex items-center justify-center">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Guest photo'}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                {photo.caption && (
                  <div className="p-2 border-t border-gold/5 flex-1 flex flex-col justify-between">
                    <p className="text-[10px] text-gray-300 line-clamp-2 leading-relaxed mb-1 font-sans">
                      {photo.caption}
                    </p>
                    <span className="text-[8px] text-gold/60 self-end font-semibold">
                      by {photo.uploadedBy}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Mobile Touch-Swipe & Zoom Lightbox Overlay */}
      {activePhotoIndex !== null && activePhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 animate-fadeIn select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar: Counter & Controls */}
          <div className="w-full max-w-5xl flex justify-between items-center py-2 px-2 z-10">
            <span className="text-xs text-gold font-mono font-medium">
              Photo {activePhotoIndex + 1} of {approvedPhotos.length}
            </span>

            <div className="flex items-center gap-3">
              {/* Download Button */}
              <a
                href={activePhoto.url}
                download={`dgci-photo-${activePhotoIndex + 1}.jpg`}
                className="p-2 rounded-full bg-gold/15 text-gold hover:bg-gold hover:text-navy-dark transition-all"
                title="Download Photo"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-4 w-4" />
              </a>

              {/* Zoom Toggle */}
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-2 rounded-full bg-gold/15 text-gold hover:bg-gold hover:text-navy-dark transition-all"
                title={isZoomed ? 'Zoom Out' : 'Zoom In'}
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setActivePhotoIndex(null);
                  setIsZoomed(false);
                }}
                className="p-2 rounded-full bg-gold/25 text-white hover:bg-gold hover:text-navy-dark transition-all"
                title="Close (Esc)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Photo Display Area */}
          <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-2">
            {/* Previous Arrow Button */}
            <button
              onClick={() => {
                setActivePhotoIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : approvedPhotos.length - 1));
                setIsZoomed(false);
              }}
              className="absolute left-2 z-20 p-2.5 rounded-full bg-black/60 border border-gold/20 text-gold hover:bg-gold hover:text-navy-dark transition-all shadow-lg"
              title="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Photo Image Container */}
            <div
              className={`relative max-w-full max-h-full flex items-center justify-center transition-transform duration-300 ${
                isZoomed ? 'overflow-auto cursor-grab scale-[2.2] z-10' : 'cursor-zoom-in'
              }`}
              onDoubleClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || 'Expanded photo'}
                className="object-contain max-w-[92vw] max-h-[78vh] rounded-lg border border-gold/20 shadow-2xl transition-all"
              />
            </div>

            {/* Next Arrow Button */}
            <button
              onClick={() => {
                setActivePhotoIndex((prev) => (prev !== null && prev < approvedPhotos.length - 1 ? prev + 1 : 0));
                setIsZoomed(false);
              }}
              className="absolute right-2 z-20 p-2.5 rounded-full bg-black/60 border border-gold/20 text-gold hover:bg-gold hover:text-navy-dark transition-all shadow-lg"
              title="Next Photo (Right Arrow)"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Bar: Caption & Uploader Details */}
          <div className="w-full max-w-xl text-center py-2 px-4 bg-[#03070d]/80 rounded-xl border border-gold/15 backdrop-blur-md">
            {activePhoto.caption ? (
              <p className="text-xs text-gray-200 font-sans italic mb-1">
                &ldquo;{activePhoto.caption}&rdquo;
              </p>
            ) : (
              <p className="text-[10px] text-gray-500 italic mb-1">DGCI Graduation 2026 Memory</p>
            )}
            <span className="text-[10px] text-gold font-medium">
              Uploaded by: {activePhoto.uploadedBy}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
