'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { StudentAvatar } from '@/components/StudentAvatar';
import {
  Lock, KeyRound, LogOut, LayoutDashboard, Settings, Calendar, Users, MessageSquare, Camera, Link as LinkIcon,
  Plus, Edit, Trash2, Check, CheckCircle, X, FileSpreadsheet, Download, Upload, AlertCircle, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { Graduate, ProgramItem, Message, Photo } from '@/lib/types';
import { calculateProgramSchedule } from '@/lib/programUtils';

export default function AdminPage() {
  const {
    ceremonyInfo, program, graduates, messages, photos, mediaLinks, isLoading, isAdmin,
    loginAdmin, logoutAdmin, updateCeremonyInfo, addProgramItem, updateProgramItem,
    deleteProgramItem, reorderProgram, addGraduate, updateGraduate, deleteGraduate,
    importGraduatesCsv, reorderGraduates, approveMessage, approveAllMessages, rejectMessage, deleteMessage,
    approvePhoto, approveAllPhotos, rejectPhoto, deletePhoto, updateMediaLinks
  } = useData();

  // Authentication state
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'info' | 'program' | 'graduates' | 'messages' | 'photos' | 'media'>('dashboard');

  // Input states for editing/adding program items
  const [showProgForm, setShowProgForm] = useState(false);
  const [editingProgId, setEditingProgId] = useState<string | null>(null);
  const [progTime, setProgTime] = useState('');
  const [progDuration, setProgDuration] = useState<number>(5);
  const [progTitle, setProgTitle] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progOrder, setProgOrder] = useState(1);

  // Input states for editing/adding graduates
  const [showGradForm, setShowGradForm] = useState(false);
  const [editingGradId, setEditingGradId] = useState<string | null>(null);
  const [gradName, setGradName] = useState('');
  const [gradDispName, setGradDispName] = useState('');
  const [gradPhoto, setGradPhoto] = useState('');
  const [gradQuote, setGradQuote] = useState('');
  const [gradLinkedin, setGradLinkedin] = useState('');
  const [gradInstagram, setGradInstagram] = useState('');
  const [gradOrder, setGradOrder] = useState(1);
  const [gradShowProfile, setGradShowProfile] = useState(true);
  const [gradBourse, setGradBourse] = useState('');
  const [gradMaster, setGradMaster] = useState('');
  const [gradIsHighestHonors, setGradIsHighestHonors] = useState(false);
  const [gradHonorsOrder, setGradHonorsOrder] = useState<number | ''>('');

  // CSV File Upload Refs
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Message Moderation Filters
  const [msgFilter, setMsgFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [msgSearch, setMsgSearch] = useState('');

  // Local state changes indicator (only relevant in local mode)
  const [showLocalSavedAlert, setShowLocalSavedAlert] = useState(false);

  // Handle Admin Auth
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    const success = await loginAdmin(password);
    setIsLoggingIn(false);
    if (!success) {
      setAuthError('Incorrect password. Please try again.');
    }
  };

  // Helper trigger for local mode save confirmations
  const triggerSaveNotification = () => {
    setShowLocalSavedAlert(true);
    setTimeout(() => setShowLocalSavedAlert(false), 3000);
  };

  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const pendingMsg = messages.filter((m) => m.status === 'pending').length;
    const approvedMsg = messages.filter((m) => m.status === 'approved').length;
    const pendingPics = photos.filter((p) => p.status === 'pending').length;
    const approvedPics = photos.filter((p) => p.status === 'approved').length;
    return {
      totalGrads: graduates.length,
      pendingMsg,
      approvedMsg,
      pendingPics,
      approvedPics
    };
  }, [graduates, messages, photos]);

  // --- CEREMONY INFO EDIT HANDLER ---
  const handleUpdateInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const classYear = formData.get('classYear') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const venue = formData.get('venue') as string;
    const locationUrl = formData.get('locationUrl') as string;
    const subtitle = formData.get('subtitle') as string;
    const closingMessage = formData.get('closingMessage') as string;
    const whatsappNumber = formData.get('whatsappNumber') as string;

    const success = await updateCeremonyInfo({
      title, classYear, date, time, venue, locationUrl, subtitle, closingMessage, whatsappNumber
    });
    if (success) triggerSaveNotification();
  };

  // --- PROGRAM OPERATIONS ---
  const handleSaveProgramItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progTitle.trim()) return;

    if (editingProgId) {
      const success = await updateProgramItem(editingProgId, {
        time: progTime || '6:30 PM',
        durationMinutes: Number(progDuration) || 5,
        title: progTitle.trim(),
        description: progDesc.trim(),
        order: progOrder
      });
      if (success) triggerSaveNotification();
    } else {
      const success = await addProgramItem({
        time: progTime || '6:30 PM',
        durationMinutes: Number(progDuration) || 5,
        title: progTitle.trim(),
        description: progDesc.trim(),
        order: progOrder,
        isCurrent: false
      });
      if (success) triggerSaveNotification();
    }

    // Reset
    setShowProgForm(false);
    setEditingProgId(null);
    setProgTime('');
    setProgDuration(5);
    setProgTitle('');
    setProgDesc('');
    setProgOrder(1);
  };

  const handleEditProgClick = (item: ProgramItem) => {
    setEditingProgId(item.id);
    setProgTime(item.time || '');
    setProgDuration(item.durationMinutes || 5);
    setProgTitle(item.title);
    setProgDesc(item.description);
    setProgOrder(item.order);
    setShowProgForm(true);
  };

  const handleToggleCurrentEvent = async (id: string, current: boolean) => {
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const success = await updateProgramItem(id, {
      isCurrent: !current,
      actualStartTime: !current ? nowTimeStr : ''
    });
    if (success) triggerSaveNotification();
  };

  const handleResetProgramTimings = async () => {
    if (confirm('Reset all live actual start times back to the scheduled start time?')) {
      const promises = program.map((item) =>
        updateProgramItem(item.id, { actualStartTime: '', isCurrent: false })
      );
      await Promise.all(promises);
      triggerSaveNotification();
    }
  };

  const handleNewProgClick = () => {
    setEditingProgId(null);
    setProgTime('');
    setProgDuration(5);
    setProgTitle('');
    setProgDesc('');
    setProgOrder(program.length + 1);
    setShowProgForm(true);
  };

  const handleDeleteProg = async (id: string) => {
    if (confirm('Are you sure you want to delete this program item?')) {
      const success = await deleteProgramItem(id);
      if (success) triggerSaveNotification();
    }
  };

  // --- GRADUATE OPERATIONS ---
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSaveGraduate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradName.trim()) return;

    const gradSlug = editingGradId || slugify(gradName);

    const gradData: Graduate = {
      id: gradSlug,
      order: gradOrder,
      fullName: gradName.trim(),
      displayName: gradDispName.trim() || gradName.trim().split(' ')[0],
      photo: gradPhoto.trim(),
      quote: gradQuote.trim(),
      linkedin: gradLinkedin.trim(),
      instagram: gradInstagram.trim(),
      showProfile: gradShowProfile,
      bourse: gradBourse.trim(),
      masterProgram: gradMaster.trim(),
      isHighestHonors: gradIsHighestHonors,
      honorsOrder: gradHonorsOrder !== '' ? Number(gradHonorsOrder) : undefined
    };

    if (editingGradId) {
      const success = await updateGraduate(editingGradId, gradData);
      if (success) triggerSaveNotification();
    } else {
      const success = await addGraduate(gradData);
      if (success) triggerSaveNotification();
    }

    // Reset
    setShowGradForm(false);
    setEditingGradId(null);
    setGradName('');
    setGradDispName('');
    setGradPhoto('');
    setGradQuote('');
    setGradLinkedin('');
    setGradInstagram('');
    setGradOrder(1);
    setGradShowProfile(true);
    setGradBourse('');
    setGradMaster('');
    setGradIsHighestHonors(false);
    setGradHonorsOrder('');
  };

  const handleEditGradClick = (g: Graduate) => {
    setEditingGradId(g.id);
    setGradName(g.fullName);
    setGradDispName(g.displayName);
    setGradPhoto(g.photo);
    setGradQuote(g.quote);
    setGradLinkedin(g.linkedin);
    setGradInstagram(g.instagram);
    setGradOrder(g.order);
    setGradShowProfile(g.showProfile);
    setGradBourse(g.bourse || '');
    setGradMaster(g.masterProgram || '');
    setGradIsHighestHonors(Boolean(g.isHighestHonors));
    setGradHonorsOrder(g.honorsOrder !== undefined && g.honorsOrder !== null ? g.honorsOrder : '');
    setShowGradForm(true);
  };

  const handleNewGradClick = () => {
    setEditingGradId(null);
    setGradName('');
    setGradDispName('');
    setGradPhoto('');
    setGradQuote('');
    setGradLinkedin('');
    setGradInstagram('');
    setGradOrder(graduates.length + 1);
    setGradShowProfile(true);
    setGradBourse('');
    setGradMaster('');
    setGradIsHighestHonors(false);
    setGradHonorsOrder('');
    setShowGradForm(true);
  };

  const handleDeleteGrad = async (id: string) => {
    if (confirm('Delete this graduate profile? This will break references on dynamic routes.')) {
      const success = await deleteGraduate(id);
      if (success) triggerSaveNotification();
    }
  };

  // CSV Bulk Import
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) {
        alert('Invalid CSV file format.');
        return;
      }

      // headers line
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const parsedGrads: Graduate[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Handle CSV quoted strings containing commas
        const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.trim().replace(/^["']|["']$/g, ''));
        
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        const name = row.fullName || row.full_name || '';
        if (!name) continue;

        parsedGrads.push({
          id: row.id || slugify(name),
          order: parseInt(row.order || row.order_number) || i,
          fullName: name,
          displayName: row.displayName || row.display_name || name.split(' ')[0],
          photo: row.photo || row.photo_url || `/graduates/student-${String(i).padStart(3, '0')}.jpg`,
          quote: row.quote || '',
          linkedin: row.linkedin || '',
          instagram: row.instagram || '',
          showProfile: row.showProfile !== undefined ? row.showProfile === 'true' || row.showProfile === true : (row.show_profile !== undefined ? row.show_profile === 'true' || row.show_profile === true : true),
          bourse: row.bourse || '',
          masterProgram: row.masterProgram || row.master_program || row.master || '',
          isHighestHonors: row.isHighestHonors === 'true' || row.is_highest_honors === 'true' || row.honors === 'true',
          honorsOrder: row.honorsOrder ? parseInt(row.honorsOrder) : (row.honors_order ? parseInt(row.honors_order) : undefined)
        });
      }

      if (parsedGrads.length > 0) {
        const success = await importGraduatesCsv(parsedGrads);
        if (success) {
          triggerSaveNotification();
          alert(`Successfully imported ${parsedGrads.length} graduates with all distinction fields!`);
        }
      }
    };
    reader.readAsText(file);
  };

  // CSV Export Graduates
  const handleCsvExport = () => {
    const headers = ['order', 'fullName', 'displayName', 'photo', 'quote', 'linkedin', 'instagram', 'bourse', 'masterProgram', 'isHighestHonors', 'honorsOrder', 'showProfile'];
    const rows = [...graduates]
      .sort((a, b) => a.order - b.order)
      .map((g) => [
        g.order,
        `"${(g.fullName || '').replace(/"/g, '""')}"`,
        `"${(g.displayName || '').replace(/"/g, '""')}"`,
        `"${(g.photo || '').replace(/"/g, '""')}"`,
        `"${(g.quote || '').replace(/"/g, '""')}"`,
        `"${(g.linkedin || '').replace(/"/g, '""')}"`,
        `"${(g.instagram || '').replace(/"/g, '""')}"`,
        `"${(g.bourse || '').replace(/"/g, '""')}"`,
        `"${(g.masterProgram || '').replace(/"/g, '""')}"`,
        g.isHighestHonors ? 'true' : 'false',
        g.honorsOrder || '',
        g.showProfile !== false ? 'true' : 'false'
      ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dgci_2026_graduates_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- MESSAGE MODERATION ---
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      // 1. Status Filter
      if (msgFilter !== 'all' && m.status !== msgFilter) return false;
      // 2. Search Filter (by message contents or sender)
      if (!msgSearch.trim()) return true;
      const search = msgSearch.toLowerCase();
      return (
        m.message.toLowerCase().includes(search) ||
        m.senderName.toLowerCase().includes(search) ||
        m.relation.toLowerCase().includes(search)
      );
    });
  }, [messages, msgFilter, msgSearch]);

  const handleApproveMessage = async (id: string) => {
    const success = await approveMessage(id);
    if (success) triggerSaveNotification();
  };

  const handleRejectMessage = async (id: string) => {
    const success = await rejectMessage(id);
    if (success) triggerSaveNotification();
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm('Delete this message permanently?')) {
      const success = await deleteMessage(id);
      if (success) triggerSaveNotification();
    }
  };

  // Export Messages
  const handleExportMessagesCSV = () => {
    const headers = ['id', 'message', 'senderName', 'isAnonymous', 'targetType', 'relation', 'status', 'createdAt'];
    const rows = messages.map((m) => [
      m.id,
      `"${m.message.replace(/"/g, '""')}"`,
      `"${m.senderName.replace(/"/g, '""')}"`,
      m.isAnonymous,
      m.targetType,
      m.relation,
      m.status,
      m.createdAt
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'guest_messages.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- PHOTO MODERATION ---
  const pendingPhotos = useMemo(() => photos.filter((p) => p.status === 'pending'), [photos]);
  const approvedPhotos = useMemo(() => photos.filter((p) => p.status === 'approved'), [photos]);

  const handleApprovePhoto = async (id: string) => {
    const success = await approvePhoto(id);
    if (success) triggerSaveNotification();
  };

  const handleRejectPhoto = async (id: string) => {
    const success = await rejectPhoto(id);
    if (success) triggerSaveNotification();
  };

  // --- MEDIA LINKS EDIT HANDLER ---
  const handleUpdateMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const photosUrl = formData.get('officialPhotosUrl') as string;
    const recapUrl = formData.get('recapVideoUrl') as string;
    const fullUrl = formData.get('fullCeremonyUrl') as string;

    const success = await updateMediaLinks({
      officialPhotosUrl: photosUrl,
      recapVideoUrl: recapUrl,
      fullCeremonyUrl: fullUrl
    });
    if (success) triggerSaveNotification();
  };

  // Loader
  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
      </div>
    );
  }

  // --- AUTH CARD DISPLAY ---
  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-16 animate-fadeIn">
        <div className="w-full max-w-sm glass-card rounded-2xl p-6 border-gold/30 gold-glow">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-gold/10 rounded-full border border-gold/25 text-gold mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-serif font-bold text-gold-light">Admin Access</h1>
            <p className="text-gray-400 text-xs mt-1">Please enter the platform administrator password.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full bg-[#03070d]/70 border border-gold/25 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-gold"
                required
              />
            </div>

            {authError && (
              <div className="text-rose-400 text-xs flex items-center gap-1.5 py-0.5">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gold-gradient text-navy-dark py-2 rounded-xl text-xs font-bold hover:bg-gold-gradient-hover active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(212,175,55,0.2)]"
            >
              <KeyRound className="h-3.5 w-3.5" /> {isLoggingIn ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- ADMIN DASHBOARD INTERFACE ---
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Save Notification Toast */}
      {showLocalSavedAlert && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-amber-600/90 text-white rounded-xl border border-gold shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4 bg-navy-dark text-gold rounded-full p-0.5" />
          <span>Dashboard saved successfully!</span>
        </div>
      )}

      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gold/15 pb-4 mb-6">
        <div>
          <span className="text-[10px] bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
            Admin Mode
          </span>
          <h1 className="text-2xl font-serif font-extrabold text-gold-light mt-1">
            Ceremony Management Panel
          </h1>
        </div>

        <button
          onClick={logoutAdmin}
          className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/20 border border-rose-900/30 px-3.5 py-1.5 rounded-lg transition-all"
        >
          <LogOut className="h-3.5 w-3.5" /> Lock Panel
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar tabs */}
        <div className="glass-card rounded-xl p-3 border-gold/15 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'dashboard' ? 'bg-gold-gradient text-navy-dark' : 'text-gray-300 hover:bg-gold/5 hover:text-gold'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard Home
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'info' ? 'bg-gold-gradient text-navy-dark' : 'text-gray-300 hover:bg-gold/5 hover:text-gold'
            }`}
          >
            <Settings className="h-4 w-4" /> Ceremony Info
          </button>
          <button
            onClick={() => setActiveTab('program')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'program' ? 'bg-gold-gradient text-navy-dark' : 'text-gray-300 hover:bg-gold/5 hover:text-gold'
            }`}
          >
            <Calendar className="h-4 w-4" /> Ceremony Program
          </button>
          <button
            onClick={() => setActiveTab('graduates')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'graduates' ? 'bg-gold-gradient text-navy-dark' : 'text-gray-300 hover:bg-gold/5 hover:text-gold'
            }`}
          >
            <Users className="h-4 w-4" /> Graduates Wall
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all relative ${
              activeTab === 'messages' ? 'bg-gold-gradient text-navy-dark' : 'text-gray-300 hover:bg-gold/5 hover:text-gold'
            }`}
          >
            <MessageSquare className="h-4 w-4" /> Guest Messages
            {stats.pendingMsg > 0 && (
              <span className="absolute right-3 bg-amber-500 text-[#050B14] font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {stats.pendingMsg}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all relative ${
              activeTab === 'photos' ? 'bg-gold-gradient text-navy-dark' : 'text-gray-300 hover:bg-gold/5 hover:text-gold'
            }`}
          >
            <Camera className="h-4 w-4" /> Guest Photos
            {stats.pendingPics > 0 && (
              <span className="absolute right-3 bg-amber-500 text-[#050B14] font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                {stats.pendingPics}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === 'media' ? 'bg-gold-gradient text-navy-dark' : 'text-gray-300 hover:bg-gold/5 hover:text-gold'
            }`}
          >
            <LinkIcon className="h-4 w-4" /> Media Links
          </button>
        </div>

        {/* Tab content panel */}
        <div className="lg:col-span-3 space-y-6">

          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Info alert banner */}
              <div className="p-4 bg-gold/5 border border-gold/20 rounded-xl text-xs text-gold-light leading-relaxed flex gap-3">
                <AlertCircle className="h-5 w-5 text-gold flex-shrink-0" />
                <div>
                  <h4 className="font-serif font-bold text-gold mb-1">Active Database Status</h4>
                  <p>
                    All operations are running in live database sync mode. You can edit content, reorder stage certificates, import csv lists, and approve guest submissions. If Supabase is disconnected, changes are safely cached in localStorage fallback.
                  </p>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="glass-card rounded-xl p-5 border border-gold/15 text-center">
                  <span className="block text-2xl font-serif font-bold text-gold">{stats.totalGrads}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Graduates</span>
                </div>
                <div className="glass-card rounded-xl p-5 border border-gold/15 text-center relative">
                  <span className="block text-2xl font-serif font-bold text-gold">{stats.pendingMsg}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pending Messages</span>
                  {stats.pendingMsg > 0 && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-navy-dark text-[8px] font-bold px-1.5 py-0.5 rounded animate-pulse">ACTION</span>
                  )}
                </div>
                <div className="glass-card rounded-xl p-5 border border-gold/15 text-center relative">
                  <span className="block text-2xl font-serif font-bold text-gold">{stats.pendingPics}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Pending Photos</span>
                  {stats.pendingPics > 0 && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-navy-dark text-[8px] font-bold px-1.5 py-0.5 rounded animate-pulse">ACTION</span>
                  )}
                </div>
              </div>

              {/* Ceremony Info Overview */}
              <div className="glass-card rounded-xl p-5 border border-gold/10">
                <h3 className="font-serif font-bold text-sm text-gold-light mb-3">Ceremony Overview</h3>
                <div className="grid grid-cols-2 gap-y-3 text-xs">
                  <div>
                    <span className="text-gray-500 block">Title</span>
                    <span className="text-gray-300 font-semibold">{ceremonyInfo.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Class Year</span>
                    <span className="text-gray-300 font-semibold">{ceremonyInfo.classYear}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Date & Time</span>
                    <span className="text-gray-300 font-semibold">{ceremonyInfo.date} at {ceremonyInfo.time}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Venue</span>
                    <span className="text-gray-300 font-semibold">{ceremonyInfo.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CEREMONY INFO EDITOR */}
          {activeTab === 'info' && (
            <div className="glass-card rounded-xl p-6 border border-gold/15">
              <h3 className="font-serif font-bold text-sm text-gold-light mb-4 pb-2 border-b border-gold/10">Edit Ceremony Information</h3>
              <form onSubmit={handleUpdateInfo} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1">Ceremony Title</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={ceremonyInfo.title}
                      className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Class Year</label>
                    <input
                      type="text"
                      name="classYear"
                      defaultValue={ceremonyInfo.classYear}
                      className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Ceremony Date</label>
                    <input
                      type="text"
                      name="date"
                      defaultValue={ceremonyInfo.date}
                      className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Ceremony Time</label>
                    <input
                      type="text"
                      name="time"
                      defaultValue={ceremonyInfo.time}
                      className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Venue Name</label>
                    <input
                      type="text"
                      name="venue"
                      defaultValue={ceremonyInfo.venue}
                      className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Location Map URL (Google Maps)</label>
                    <input
                      type="url"
                      name="locationUrl"
                      defaultValue={ceremonyInfo.locationUrl}
                      className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Invitation Subtitle</label>
                  <textarea
                    name="subtitle"
                    rows={2}
                    defaultValue={ceremonyInfo.subtitle}
                    className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Closing Tagline</label>
                  <input
                    type="text"
                    name="closingMessage"
                    defaultValue={ceremonyInfo.closingMessage}
                    className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">WhatsApp Contact Phone Number (e.g. +201234567890)</label>
                  <input
                    type="text"
                    name="whatsappNumber"
                    defaultValue={ceremonyInfo.whatsappNumber || ''}
                    placeholder="+201234567890"
                    className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gold-gradient text-navy-dark px-4 py-2 rounded-lg font-bold hover:bg-gold-gradient-hover transition-all"
                >
                  Save Ceremony Info
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PROGRAM MANAGER */}
          {activeTab === 'program' && (() => {
            const { calculatedItems, formattedTotalDuration, ceremonyEndTime } = calculateProgramSchedule(
              program,
              ceremonyInfo.time || '6:30 PM'
            );

            return (
              <div className="space-y-4">
                {/* Header Summary & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gold/5 border border-gold/20 p-3.5 rounded-xl">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-gold-light">Ceremony Timeline Manager</h3>
                    <p className="text-gray-400 text-[11px] font-sans">
                      Start Time: <strong className="text-gold">{ceremonyInfo.time || '6:30 PM'}</strong> &bull; Total Duration: <strong className="text-gold">{formattedTotalDuration}</strong> &bull; Est. End: <strong className="text-gold">{ceremonyEndTime}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetProgramTimings}
                      className="bg-navy-dark text-gray-300 border border-gold/20 text-xs px-3 py-1.5 rounded-lg font-semibold hover:border-gold/40 hover:text-gold transition-all"
                      title="Reset all live actual start times back to default scheduled times"
                    >
                      Reset Live Shifts
                    </button>
                    <button
                      onClick={handleNewProgClick}
                      className="bg-gold-gradient text-navy-dark text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Timeline Event
                    </button>
                  </div>
                </div>

                {/* Quick Ceremony Start Time Adjuster */}
                <div className="glass-card rounded-xl p-3 border border-gold/20 bg-[#03070d]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-gold font-semibold flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Quick Ceremony Start Time Adjuster:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {['6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM'].map((tStr) => (
                      <button
                        key={tStr}
                        onClick={async () => {
                          const ok = await updateCeremonyInfo({ ...ceremonyInfo, time: tStr });
                          if (ok) triggerSaveNotification();
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-all ${
                          ceremonyInfo.time === tStr
                            ? 'bg-gold text-navy-dark border-gold shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                            : 'bg-navy-dark text-gray-300 border-gold/20 hover:border-gold/40'
                        }`}
                      >
                        {tStr}
                      </button>
                    ))}
                    <input
                      type="text"
                      placeholder="e.g. 7:15 PM"
                      defaultValue={ceremonyInfo.time || '6:30 PM'}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            const ok = await updateCeremonyInfo({ ...ceremonyInfo, time: val });
                            if (ok) triggerSaveNotification();
                          }
                        }
                      }}
                      className="bg-[#03070d] border border-gold/20 rounded px-2 py-0.5 text-white w-24 text-[10px]"
                    />
                  </div>
                </div>

                {/* Event Editor Form */}
                {showProgForm && (
                  <div className="glass-card rounded-xl p-5 border border-gold/25 space-y-3 text-xs">
                    <h4 className="font-serif font-bold text-gold">{editingProgId ? 'Edit Event Item' : 'New Timeline Event'}</h4>
                    <form onSubmit={handleSaveProgramItem} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-gray-400 mb-1">Scheduled Start Time</label>
                          <input
                            type="text"
                            placeholder="e.g. 6:30 PM"
                            value={progTime}
                            onChange={(e) => setProgTime(e.target.value)}
                            className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gold mb-1 font-semibold">Duration (Minutes)</label>
                          <input
                            type="number"
                            placeholder="5"
                            value={progDuration}
                            onChange={(e) => setProgDuration(parseInt(e.target.value) || 5)}
                            className="w-full bg-[#03070d]/50 border border-gold/40 rounded-lg p-2 text-white font-bold"
                            required
                            min={1}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-gray-400 mb-1">Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Highest Honors Ceremony"
                            value={progTitle}
                            onChange={(e) => setProgTitle(e.target.value)}
                            className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Description</label>
                        <textarea
                          placeholder="Detailed description of timeline stage..."
                          value={progDesc}
                          onChange={(e) => setProgDesc(e.target.value)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                          rows={2}
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-gray-400 mb-1">Timeline Order</label>
                        <input
                          type="number"
                          value={progOrder}
                          onChange={(e) => setProgOrder(parseInt(e.target.value) || 1)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-gold-gradient text-navy-dark px-3 py-1.5 rounded-lg font-bold"
                        >
                          Save Item
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowProgForm(false)}
                          className="bg-gray-800 text-white px-3 py-1.5 rounded-lg font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Items List Table */}
                <div className="glass-card rounded-xl overflow-hidden border border-gold/15">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gold/5 border-b border-gold/15 text-gold-light">
                        <th className="p-3">Order</th>
                        <th className="p-3">Dynamic Range</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Event Title</th>
                        <th className="p-3">Live Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculatedItems.map((item) => (
                        <tr key={item.id} className={`border-b border-gold/5 transition-all ${item.isCurrent ? 'bg-gold/10 text-white font-semibold' : 'hover:bg-gold/5 text-gray-300'}`}>
                          <td className="p-3 font-semibold text-gold">#{item.order}</td>
                          <td className="p-3 font-mono font-bold text-gold">{item.formattedRange}</td>
                          <td className="p-3">
                            <span className="bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/20 font-sans text-[10px]">
                              ⏱️ {item.durationMinutes}m
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold block text-white">{item.title}</span>
                            <span className="text-[10px] text-gray-400 line-clamp-1">{item.description}</span>
                            {item.actualStartTime && (
                              <span className="text-[9px] text-emerald-300 block mt-0.5 font-mono">
                                ⚡ Started Live at {item.actualStartTime}
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleCurrentEvent(item.id, item.isCurrent)}
                              className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                                item.isCurrent
                                  ? 'bg-gold text-navy-dark border border-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                                  : 'bg-[#03070d] text-gray-400 border border-gold/20 hover:text-gold hover:border-gold/40'
                              }`}
                            >
                              {item.isCurrent ? '⚡ Active Now' : 'Start Station Now'}
                            </button>
                          </td>
                          <td className="p-3 text-right flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditProgClick(item)}
                              className="p-1 text-gold hover:bg-gold/10 rounded"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProg(item.id)}
                              className="p-1 text-rose-400 hover:bg-rose-950/20 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* TAB 4: GRADUATES PANEL */}
          {activeTab === 'graduates' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-serif font-bold text-sm text-gold-light">Graduates Roll Call</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {/* CSV Export */}
                  <button
                    onClick={handleCsvExport}
                    className="inline-flex items-center gap-1 bg-[#03070d] text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:border-gold transition-all"
                  >
                    <Download className="h-3.5 w-3.5" /> Export CSV
                  </button>
                  {/* CSV Import */}
                  <button
                    onClick={() => csvInputRef.current?.click()}
                    className="inline-flex items-center gap-1 bg-[#03070d] text-gold border border-gold/30 px-3 py-1.5 rounded-lg hover:border-gold transition-all"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" /> Import CSV
                  </button>
                  <input
                    type="file"
                    ref={csvInputRef}
                    onChange={handleCsvImport}
                    accept=".csv"
                    className="hidden"
                  />
                  {/* Add New */}
                  <button
                    onClick={handleNewGradClick}
                    className="bg-gold-gradient text-navy-dark px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Student
                  </button>
                </div>
              </div>

              {/* CSV Format Info */}
              <div className="p-3 bg-[#03070d]/30 border border-gold/10 rounded-lg text-[10px] text-gray-500 font-sans leading-relaxed">
                <span className="font-bold text-gold-light uppercase block mb-1">CSV Template Guide</span>
                CSV format: <code className="text-gold">order,fullName,displayName,photo,quote,linkedin,instagram</code>.
                Make sure order is chronological, and photo points to <code className="text-gray-300">/graduates/student-001.jpg</code>.
              </div>

              {/* Student Form */}
              {showGradForm && (
                <div className="glass-card rounded-xl p-5 border border-gold/25 space-y-3 text-xs">
                  <h4 className="font-serif font-bold text-gold">{editingGradId ? 'Edit Student Details' : 'New Graduate Profile'}</h4>
                  <form onSubmit={handleSaveGraduate} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Full Name</label>
                        <input
                          type="text"
                          placeholder="Youhanna Maher"
                          value={gradName}
                          onChange={(e) => setGradName(e.target.value)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Display Name</label>
                        <input
                          type="text"
                          placeholder="Youhanna"
                          value={gradDispName}
                          onChange={(e) => setGradDispName(e.target.value)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Walk Order Index</label>
                        <input
                          type="number"
                          value={gradOrder}
                          onChange={(e) => setGradOrder(parseInt(e.target.value) || 1)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-gray-400 mb-1">Photo Path (Local asset URL / Cloudinary / Supabase URL)</label>
                        <input
                          type="text"
                          placeholder="/graduates/student-001.jpg"
                          value={gradPhoto}
                          onChange={(e) => setGradPhoto(e.target.value)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="gradShowProfile"
                          checked={gradShowProfile}
                          onChange={(e) => setGradShowProfile(e.target.checked)}
                          className="h-4 w-4 border-gold/20 bg-[#03070d] text-gold focus:ring-0"
                        />
                        <label htmlFor="gradShowProfile" className="text-gray-300">Show Profile Page?</label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">LinkedIn URL</label>
                        <input
                          type="url"
                          placeholder="https://linkedin.com/..."
                          value={gradLinkedin}
                          onChange={(e) => setGradLinkedin(e.target.value)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Instagram URL</label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/..."
                          value={gradInstagram}
                          onChange={(e) => setGradInstagram(e.target.value)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Bourse / Scholarship Info (e.g. French Govt Bourse)</label>
                        <input
                          type="text"
                          placeholder="French Government Bourse"
                          value={gradBourse}
                          onChange={(e) => setGradBourse(e.target.value)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 mb-1">Master 2 in France (e.g. M2 IAE Poitiers)</label>
                        <input
                          type="text"
                          placeholder="Master 2 - IAE Poitiers, France"
                          value={gradMaster}
                          onChange={(e) => setGradMaster(e.target.value)}
                          className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gold/5 border border-gold/20 rounded-lg">
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="gradIsHighestHonors"
                          checked={gradIsHighestHonors}
                          onChange={(e) => setGradIsHighestHonors(e.target.checked)}
                          className="h-4 w-4 border-gold/20 bg-[#03070d] text-gold focus:ring-0"
                        />
                        <label htmlFor="gradIsHighestHonors" className="text-gold font-semibold text-xs">🏆 Is Highest Honors Recipient?</label>
                      </div>

                      {gradIsHighestHonors && (
                        <div>
                          <label className="block text-gold mb-1 text-xs font-semibold">Honors Ceremony Walk Rank (1..10)</label>
                          <input
                            type="number"
                            placeholder="1"
                            value={gradHonorsOrder}
                            onChange={(e) => setGradHonorsOrder(e.target.value ? parseInt(e.target.value) : '')}
                            className="w-full bg-[#03070d] border border-gold/40 rounded-lg p-2 text-white text-xs"
                          />
                        </div>
                      )}
                    </div>



                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-gold-gradient text-navy-dark px-3 py-1.5 rounded-lg font-bold"
                      >
                        Save Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGradForm(false)}
                        className="bg-gray-800 text-white px-3 py-1.5 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Graduates roll table */}
              <div className="glass-card rounded-xl overflow-hidden border border-gold/15 max-h-[70vh] overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gold/5 border-b border-gold/15 text-gold-light">
                      <th className="p-3">Walk Order</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Profile Link</th>
                      <th className="p-3">Socials</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...graduates]
                      .sort((a, b) => a.order - b.order)
                      .map((g) => (
                        <tr key={g.id} className="border-b border-gold/5 hover:bg-gold/5 text-gray-300">
                          <td className="p-3 text-gold font-serif font-bold text-center w-16">
                            #{String(g.order).padStart(3, '0')}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <StudentAvatar fullName={g.fullName} photoUrl={g.photo} size="sm" />
                              <div>
                                <span className="font-bold block text-gold-light">{g.fullName}</span>
                                <span className="text-[10px] text-gray-500">{g.displayName}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {g.showProfile ? (
                              <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2 py-0.5 rounded">
                                <Eye className="h-3 w-3" /> Visible
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] text-gray-400 bg-gray-900/20 border border-gray-800/40 px-2 py-0.5 rounded">
                                <EyeOff className="h-3 w-3" /> Hidden
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1.5">
                              {g.linkedin && <span className="bg-gold/10 text-gold px-1 rounded text-[8px]">LN</span>}
                              {g.instagram && <span className="bg-gold/10 text-gold px-1 rounded text-[8px]">IG</span>}
                              {!g.linkedin && !g.instagram && <span className="text-gray-600">-</span>}
                            </div>
                          </td>
                          <td className="p-3 text-right flex justify-end gap-1.5 items-center">
                            <button
                              onClick={() => handleEditGradClick(g)}
                              className="p-1.5 text-gold hover:bg-gold/10 rounded"
                              title="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGrad(g.id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-950/20 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: GUEST MESSAGES MODERATION */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="font-serif font-bold text-sm text-gold-light">Message Moderation</h3>
                <div className="flex gap-2">
                  {stats.pendingMsg > 0 && (
                    <button
                      onClick={async () => {
                        if (confirm(`Approve all ${stats.pendingMsg} pending messages?`)) {
                          await approveAllMessages();
                          triggerSaveNotification();
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve All ({stats.pendingMsg})
                    </button>
                  )}
                  <button
                    onClick={handleExportMessagesCSV}
                    className="bg-[#03070d] text-gold border border-gold/30 text-xs px-3 py-1.5 rounded-lg hover:border-gold transition-all inline-flex items-center gap-1"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Messages
                  </button>
                </div>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap gap-2 items-center justify-between bg-[#03070d]/30 border border-gold/15 p-3 rounded-xl text-xs">
                <div className="flex gap-1.5">
                  {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMsgFilter(filter)}
                      className={`px-3 py-1 rounded-lg capitalize font-semibold transition-all ${
                        msgFilter === filter
                          ? 'bg-gold text-navy-dark'
                          : 'text-gray-400 hover:text-gold hover:bg-gold/5'
                      }`}
                    >
                      {filter} ({messages.filter(m => filter === 'all' || m.status === filter).length})
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Search sender/words..."
                  value={msgSearch}
                  onChange={(e) => setMsgSearch(e.target.value)}
                  className="bg-[#050B14] border border-gold/20 rounded-lg py-1 px-3.5 text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              {/* Messages list */}
              {filteredMessages.length === 0 ? (
                <div className="glass-card rounded-xl p-8 text-center border-gold/10 text-gray-500 text-xs">
                  <p>No messages match your current filters.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="glass-card rounded-xl p-4 border border-gold/10 flex flex-col justify-between gap-3 text-left relative"
                    >
                      <div>
                        {/* Target badge */}
                        <div className="flex justify-between items-center text-[10px] mb-2 font-sans">
                          <span className="text-gray-500">
                            Relation: <strong className="text-gold-light">{msg.relation}</strong>
                          </span>
                          <span className="font-semibold text-gold-light bg-gold/5 border border-gold/15 px-2 py-0.5 rounded text-[8px]">
                            {msg.targetType === 'class' ? 'To Class' : `To: ${msg.targetGraduateIds.join(', ')}`}
                          </span>
                        </div>
                        {/* Text */}
                        <p className="text-xs text-gray-200 font-sans leading-relaxed whitespace-pre-line">
                          &ldquo;{msg.message}&rdquo;
                        </p>
                      </div>

                      {/* Footer & approvals */}
                      <div className="border-t border-gold/5 pt-3 mt-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] text-gray-500 font-sans">
                        <div>
                          <span>From: <strong>{msg.isAnonymous ? 'Anonymous' : msg.senderName}</strong></span>
                          <span className="mx-2">•</span>
                          <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex gap-2 self-end">
                          {msg.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveMessage(msg.id)}
                              className="px-2.5 py-1 bg-emerald-950/40 hover:bg-emerald-500 text-emerald-400 hover:text-navy-dark border border-emerald-500/25 rounded font-bold uppercase tracking-wider transition-all"
                            >
                              Approve
                            </button>
                          )}
                          {msg.status !== 'rejected' && (
                            <button
                              onClick={() => handleRejectMessage(msg.id)}
                              className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-500 text-rose-400 hover:text-navy-dark border border-rose-500/25 rounded font-bold uppercase tracking-wider transition-all"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 text-gray-500 hover:text-rose-400 transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: PHOTO MODERATION */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Pending Queue */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-serif font-bold text-sm text-gold-light">Pending Guest Uploads ({pendingPhotos.length})</h3>
                  {pendingPhotos.length > 0 && (
                    <button
                      onClick={async () => {
                        if (confirm(`Approve all ${pendingPhotos.length} pending photos?`)) {
                          await approveAllPhotos();
                          triggerSaveNotification();
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Approve All Photos ({pendingPhotos.length})
                    </button>
                  )}
                </div>
                {pendingPhotos.length === 0 ? (
                  <div className="glass-card rounded-xl p-6 text-center border-gold/10 text-gray-500 text-xs">
                    <p>No guest photo uploads pending approval.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pendingPhotos.map((photo) => (
                      <div key={photo.id} className="glass-card rounded-xl overflow-hidden border border-gold/15 flex flex-col justify-between">
                        <div className="aspect-video w-full bg-black flex items-center justify-center relative">
                          <img src={photo.url} alt="Pending upload" className="object-contain w-full h-full" />
                        </div>
                        <div className="p-3 text-xs">
                          {photo.caption && <p className="text-gray-300 font-sans italic mb-1">&ldquo;{photo.caption}&rdquo;</p>}
                          <span className="text-[10px] text-gray-500">Uploaded by: <strong>{photo.uploadedBy}</strong></span>
                          
                          <div className="flex gap-2 mt-4 pt-3 border-t border-gold/5 justify-end">
                            <button
                              onClick={() => handleApprovePhoto(photo.id)}
                              className="px-3 py-1 bg-emerald-950/40 hover:bg-emerald-500 text-emerald-400 hover:text-navy-dark border border-emerald-500/25 rounded text-[10px] font-bold uppercase transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectPhoto(photo.id)}
                              className="px-3 py-1 bg-rose-950/40 hover:bg-rose-500 text-rose-400 hover:text-navy-dark border border-rose-500/25 rounded text-[10px] font-bold uppercase transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approved Photos Grid */}
              <div className="pt-4 border-t border-gold/10">
                <h3 className="font-serif font-bold text-sm text-gold-light mb-4">Approved Photos ({approvedPhotos.length})</h3>
                {approvedPhotos.length === 0 ? (
                  <div className="glass-card rounded-xl p-6 text-center border-gold/10 text-gray-500 text-xs">
                    <p>No photos have been approved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {approvedPhotos.map((photo) => (
                      <div key={photo.id} className="glass-card rounded-xl overflow-hidden border border-gold/10 relative group">
                        <img src={photo.url} alt="Approved" className="object-cover aspect-square w-full" />
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between text-xs text-left">
                          <div>
                            <p className="text-gray-200 line-clamp-3 italic mb-1">&ldquo;{photo.caption}&rdquo;</p>
                            <span className="text-[10px] text-gold-light">By {photo.uploadedBy}</span>
                          </div>
                          <button
                            onClick={() => deletePhoto(photo.id)}
                            className="text-rose-400 hover:text-rose-300 font-semibold self-end inline-flex items-center gap-1 text-[10px]"
                          >
                            <Trash2 className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: MEDIA LINKS EDITOR */}
          {activeTab === 'media' && (
            <div className="glass-card rounded-xl p-6 border border-gold/15">
              <h3 className="font-serif font-bold text-sm text-gold-light mb-4 pb-2 border-b border-gold/10">Edit Media Archive Links</h3>
              <form onSubmit={handleUpdateMedia} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 mb-1">Official Photos Album URL (Google Drive / OneDrive)</label>
                  <input
                    type="url"
                    name="officialPhotosUrl"
                    defaultValue={mediaLinks.officialPhotosUrl}
                    className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2.5 text-white"
                    placeholder="https://drive.google.com/..."
                  />
                  <span className="text-[10px] text-gray-500 mt-1 block">Leave empty or set placeholder to display Coming Soon ribbon.</span>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">Ceremony Recap Video URL (YouTube)</label>
                  <input
                    type="url"
                    name="recapVideoUrl"
                    defaultValue={mediaLinks.recapVideoUrl}
                    className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2.5 text-white"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-1">DGCI 2026 Video URL (YouTube)</label>
                  <input
                    type="url"
                    name="fullCeremonyUrl"
                    defaultValue={mediaLinks.fullCeremonyUrl}
                    className="w-full bg-[#03070d]/50 border border-gold/20 rounded-lg p-2.5 text-white"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <button
                  type="submit"
                  className="bg-gold-gradient text-navy-dark px-4 py-2 rounded-lg font-bold hover:bg-gold-gradient-hover transition-all"
                >
                  Save Media Links
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
