'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Camera, Image as ImageIcon, Video, ExternalLink, HelpCircle, Upload, CheckCircle2, AlertTriangle, Play } from 'lucide-react';

export default function MediaHubPage() {
  const { photos, mediaLinks, submitPhoto, isLoading } = useData();

  // Form State
  const [caption, setCaption] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Status State
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'compressing' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadCount, setUploadCount] = useState(0);

  // Lightbox State
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);

  // Only show approved photos in public gallery
  const approvedPhotos = useMemo(() => {
    return photos.filter((p) => p.status === 'approved');
  }, [photos]);

  // Client-side image compression
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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

          // Compress to JPEG with 0.75 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image must be smaller than 5 MB.');
      setUploadStatus('error');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadStatus('idle');
    setErrorMessage('');
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (uploadCount >= 5) {
      setErrorMessage('You have reached the upload limit of 5 photos per session.');
      setUploadStatus('error');
      return;
    }

    try {
      setUploadStatus('compressing');
      
      // Compress client-side
      const base64Image = await compressImage(selectedFile);
      
      setUploadStatus('uploading');

      // Submit photo data
      const success = await submitPhoto({
        url: base64Image, // Save compressed base64 string as URL
        caption: caption.trim(),
        uploadedBy: uploadedBy.trim() || 'Anonymous'
      });

      if (success) {
        setUploadStatus('success');
        setCaption('');
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadCount((prev) => prev + 1);

        // Reset
        setTimeout(() => {
          setUploadStatus('idle');
        }, 5000);
      } else {
        setUploadStatus('error');
        setErrorMessage('Failed to upload. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setErrorMessage('Compression failed. Please choose another image.');
    }
  };

  // Helper to extract Youtube ID for embed
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : '';
  };

  const recapEmbed = getYoutubeEmbedUrl(mediaLinks.recapVideoUrl);
  const fullEmbed = getYoutubeEmbedUrl(mediaLinks.fullCeremonyUrl);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full animate-fadeIn space-y-12">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-gold-light tracking-wide mb-2">
          Photo & Video Hub
        </h1>
        <p className="text-gray-400 text-xs max-w-sm mx-auto leading-relaxed">
          Access official photos, watch ceremony recordings, and upload your snapshots of the big day.
        </p>
      </div>

      {/* Grid: Section 1 & Section 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Guest Photo Upload Box */}
        <div className="glass-card rounded-2xl p-6 border-gold/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera className="h-5 w-5 text-gold" />
              <h2 className="text-base font-serif font-bold text-gold-light">Guest Photo Upload</h2>
            </div>
            <p className="text-gray-400 text-xs mb-4 leading-relaxed font-sans">
              Share your moments from the crowd! Upload photos here. (Max 5 photos, max 5MB each). They will be added to the pending queue for admin review.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Input container */}
              <div className="border border-dashed border-gold/35 rounded-xl p-4 text-center cursor-pointer hover:bg-gold/5 transition-all relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadCount >= 5}
                />
                
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={previewUrl} alt="Preview" className="h-28 object-contain rounded-lg border border-gold/20 mb-2" />
                    <span className="text-[10px] text-gold font-medium">Click to replace photo</span>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gold/60 mb-2" />
                    <span className="text-xs text-gray-300 font-semibold">Select Photo from Library or Camera</span>
                    <span className="text-[9px] text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                  </div>
                )}
              </div>

              {/* Caption */}
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
                  disabled={uploadCount >= 5}
                />
              </div>

              {/* Name */}
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
                  disabled={uploadCount >= 5}
                />
              </div>

              {/* Error / Success feedback */}
              {uploadStatus === 'success' && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Photo uploaded successfully for review! ({uploadCount}/5)</span>
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!selectedFile || uploadStatus === 'compressing' || uploadStatus === 'uploading' || uploadCount >= 5}
                className="w-full bg-gold-gradient text-navy-dark py-2 rounded-xl text-xs font-bold tracking-wider hover:bg-gold-gradient-hover transition-all disabled:opacity-40"
              >
                {uploadStatus === 'compressing' && 'Compressing Image...'}
                {uploadStatus === 'uploading' && 'Uploading...'}
                {uploadStatus !== 'compressing' && uploadStatus !== 'uploading' && 'Upload Photo'}
              </button>
            </form>
          </div>
          <div className="text-right text-[9px] text-gray-500 mt-2">
            Uploaded: {uploadCount} / 5 photos this session
          </div>
        </div>

        {/* Official Photos Link Box */}
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

      {/* Section 3: Ceremony Video */}
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-5 w-5 text-gold" />
          <h2 className="text-base uppercase tracking-[0.15em] text-gold font-bold font-serif">Ceremony Video Recordings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recap Video Box */}
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

          {/* Full Ceremony Video Box */}
          <div className="glass-card rounded-2xl p-5 border border-gold/15">
            <h3 className="text-xs uppercase tracking-wider text-gold-light font-semibold mb-3">Full Ceremony Recording</h3>
            {fullEmbed ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gold/10">
                <iframe
                  src={fullEmbed}
                  title="Full Ceremony Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
            ) : (
              <div className="bg-[#03070d]/30 aspect-video rounded-xl border border-gold/10 flex flex-col items-center justify-center text-center p-4">
                <Play className="h-8 w-8 text-gold/30 mb-2" />
                <p className="text-[10px] text-gray-500 italic">&ldquo;Full ceremony recording coming soon&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 4: Approved Guest Uploads Gallery */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base uppercase tracking-[0.15em] text-gold font-bold font-serif">Guest Memories Gallery</h2>
          <span className="text-[10px] text-gray-500 bg-[#03070d] px-2 py-0.5 border border-gold/15 rounded font-semibold">
            {approvedPhotos.length} photos
          </span>
        </div>

        {approvedPhotos.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border-gold/10 max-w-sm mx-auto">
            <HelpCircle className="h-8 w-8 text-gold mx-auto mb-2 opacity-50" />
            <p className="text-gray-400 text-xs">No approved guest photos yet. Upload yours above to share the memory!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {approvedPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhotoUrl(photo.url)}
                className="glass-card rounded-xl overflow-hidden border border-gold/10 hover:border-gold/30 cursor-zoom-in transition-all duration-300 group flex flex-col h-full"
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

      {/* Lightbox Overlay */}
      {activePhotoUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
          onClick={() => setActivePhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <img src={activePhotoUrl} alt="Expanded preview" className="object-contain max-w-full max-h-full rounded border border-gold/20 shadow-2xl" />
            <button
              onClick={() => setActivePhotoUrl(null)}
              className="absolute top-2 right-2 text-white bg-gold/25 hover:bg-gold hover:text-navy-dark p-2 rounded-full text-xs font-bold transition-all"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
