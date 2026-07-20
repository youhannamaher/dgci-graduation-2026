'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import {
  CeremonyInfo,
  ProgramItem,
  Graduate,
  Message,
  Photo,
  MediaLinks,
  JourneyItem
} from '@/lib/types';

// Direct JSON templates for instant offline fallback
import infoTemplate from '../../data/ceremony-info.json';
import progTemplate from '../../data/program.json';
import gradsTemplate from '../../data/graduates.json';
import galleryTemplate from '../../data/gallery.json';
import msgTemplate from '../../data/messages.json';
import mediaTemplate from '../../data/media-links.json';
import journeyTemplate from '../../data/journey.json';

interface DataContextType {
  ceremonyInfo: CeremonyInfo;
  program: ProgramItem[];
  graduates: Graduate[];
  messages: Message[];
  photos: Photo[];
  mediaLinks: MediaLinks;
  journey: JourneyItem[];
  isLoading: boolean;
  isSupabaseMode: boolean;
  dbSource: 'supabase' | 'sql' | 'template' | 'loading';
  isAdmin: boolean;
  refreshData: () => Promise<void>;
  
  // Auth actions
  loginAdmin: (password: string) => Promise<boolean>;
  logoutAdmin: () => void;

  // Ceremony actions
  updateCeremonyInfo: (info: CeremonyInfo) => Promise<boolean>;

  // Program actions
  addProgramItem: (item: Omit<ProgramItem, 'id'>) => Promise<boolean>;
  updateProgramItem: (id: string, item: Partial<ProgramItem>) => Promise<boolean>;
  deleteProgramItem: (id: string) => Promise<boolean>;
  reorderProgram: (items: ProgramItem[]) => Promise<boolean>;

  // Graduate actions
  addGraduate: (grad: Graduate) => Promise<boolean>;
  updateGraduate: (id: string, grad: Partial<Graduate>) => Promise<boolean>;
  deleteGraduate: (id: string) => Promise<boolean>;
  importGraduatesCsv: (graduatesList: Graduate[]) => Promise<boolean>;
  reorderGraduates: (orderedGrads: Graduate[]) => Promise<boolean>;

  // Message actions
  submitMessage: (msg: Omit<Message, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  approveMessage: (id: string) => Promise<boolean>;
  rejectMessage: (id: string) => Promise<boolean>;
  deleteMessage: (id: string) => Promise<boolean>;

  // Photo actions
  submitPhoto: (photo: Omit<Photo, 'id' | 'status' | 'createdAt'>) => Promise<boolean>;
  approvePhoto: (id: string) => Promise<boolean>;
  rejectPhoto: (id: string) => Promise<boolean>;
  deletePhoto: (id: string) => Promise<boolean>;

  // Media Link actions
  updateMediaLinks: (links: MediaLinks) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ceremonyInfo, setCeremonyInfo] = useState<CeremonyInfo>(infoTemplate as CeremonyInfo);
  const [program, setProgram] = useState<ProgramItem[]>([]);
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [mediaLinks, setMediaLinks] = useState<MediaLinks>(mediaTemplate as MediaLinks);
  const [journey, setJourney] = useState<JourneyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbSource, setDbSource] = useState<'supabase' | 'sql' | 'template' | 'loading'>('loading');
  const [isAdmin, setIsAdmin] = useState(false);

  // Authenticate admin check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('dgci_admin_authenticated');
      if (auth === 'true') {
        setIsAdmin(true);
      }
    }
  }, []);

  const loginAdmin = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAdmin(true);
        sessionStorage.setItem('dgci_admin_authenticated', 'true');
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('dgci_admin_authenticated');
  };

  // Helper: save to local storage
  const saveLocal = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // Helper: Load local json templates + apply localStorage changes
  const loadLocalDataWithLocalStorage = () => {
    let infoData = { ...infoTemplate } as CeremonyInfo;
    let progData = [...progTemplate] as ProgramItem[];
    let gradsData = [...gradsTemplate] as Graduate[];
    let galleryData = [...galleryTemplate] as Photo[];
    let msgData = [...msgTemplate] as Message[];
    let mediaData = { ...mediaTemplate } as MediaLinks;

    if (typeof window !== 'undefined') {
      const localInfo = localStorage.getItem('dgci_ceremony_info');
      if (localInfo) infoData = JSON.parse(localInfo);

      const localProg = localStorage.getItem('dgci_program');
      if (localProg) progData = JSON.parse(localProg);

      const localGrads = localStorage.getItem('dgci_graduates');
      if (localGrads) gradsData = JSON.parse(localGrads);

      const localMsg = localStorage.getItem('dgci_messages');
      if (localMsg) msgData = JSON.parse(localMsg);

      const localPhotos = localStorage.getItem('dgci_photos');
      if (localPhotos) galleryData = JSON.parse(localPhotos);

      const localMedia = localStorage.getItem('dgci_media_links');
      if (localMedia) mediaData = JSON.parse(localMedia);
    }

    setCeremonyInfo(infoData);
    setProgram(progData);
    setGraduates(gradsData);
    setMessages(msgData);
    setPhotos(galleryData);
    setMediaLinks(mediaData);
  };

  // Perform background database query to fetch live updates in a single combined request
  const loadAllDataBackground = async () => {
    try {
      const res = await fetch('/api/data/all?t=' + Date.now());

      if (!res.ok) {
        throw new Error('Unified data API fetch failed');
      }

      const combined = await res.json();
      
      const source = combined._source || 'template';
      setDbSource(source);

      let journeyData = combined.journey;
      let infoData = combined.ceremonyInfo;
      let progData = combined.program;
      let gradsData = combined.graduates;
      let msgData = combined.messages;
      let galleryData = combined.photos;
      let mediaData = combined.mediaLinks;

      // Update React state directly with live responses!
      setJourney(journeyData);
      setCeremonyInfo(infoData);
      setProgram(progData);
      setGraduates(gradsData);
      setMessages(msgData);
      setPhotos(galleryData);
      setMediaLinks(mediaData);

      // Cache fresh live database content in local storage
      if (source === 'supabase' || source === 'sql') {
        saveLocal('dgci_ceremony_info', infoData);
        saveLocal('dgci_program', progData);
        saveLocal('dgci_graduates', gradsData);
        saveLocal('dgci_messages', msgData);
        saveLocal('dgci_photos', galleryData);
        saveLocal('dgci_media_links', mediaData);
      }
    } catch (e) {
      console.warn('Background database sync failed, utilizing offline templates:', e);
      setDbSource('template');
    }
  };

  // Main loader (Queries Vercel Server API silently in the background)
  useEffect(() => {
    // 1. Instantly display templates/localStorage overrides to turn off the loading spinner
    loadLocalDataWithLocalStorage();
    setJourney(journeyTemplate as JourneyItem[]);
    setIsLoading(false);

    // 2. Fetch live updates
    loadAllDataBackground();
  }, []);

  const refreshData = async () => {
    setDbSource('loading');
    await loadAllDataBackground();
  };

  // --- WRITE ACTIONS (Routed through Vercel API proxy) ---

  // 1. Ceremony Info
  const updateCeremonyInfo = async (info: CeremonyInfo): Promise<boolean> => {
    setCeremonyInfo(info);
    try {
      const res = await fetch('/api/data/ceremony-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: info })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_ceremony_info', info);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_ceremony_info', info);
      return true;
    }
  };

  // 2. Program Actions
  const addProgramItem = async (item: Omit<ProgramItem, 'id'>): Promise<boolean> => {
    const newItem: ProgramItem = {
      ...item,
      id: `prog-${Date.now()}`
    };
    const updated = [...program, newItem].sort((a, b) => a.order - b.order);
    setProgram(updated);

    try {
      const res = await fetch('/api/data/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', data: newItem })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_program', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_program', updated);
      return true;
    }
  };

  const updateProgramItem = async (id: string, fields: Partial<ProgramItem>): Promise<boolean> => {
    const updated = program.map(item => {
      if (item.id === id) {
        return { ...item, ...fields };
      }
      if (fields.isCurrent && item.id !== id) {
        return { ...item, isCurrent: false };
      }
      return item;
    }).sort((a, b) => a.order - b.order);
    
    setProgram(updated);

    try {
      const res = await fetch('/api/data/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, fields })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_program', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_program', updated);
      return true;
    }
  };

  const deleteProgramItem = async (id: string): Promise<boolean> => {
    const updated = program.filter(item => item.id !== id);
    setProgram(updated);

    try {
      const res = await fetch('/api/data/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_program', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_program', updated);
      return true;
    }
  };

  const reorderProgram = async (items: ProgramItem[]): Promise<boolean> => {
    const ordered = items.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));
    setProgram(ordered);

    try {
      const res = await fetch('/api/data/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', list: ordered })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_program', ordered);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_program', ordered);
      return true;
    }
  };

  // 3. Graduate Actions
  const addGraduate = async (grad: Graduate): Promise<boolean> => {
    const updated = [...graduates, grad].sort((a, b) => a.order - b.order);
    setGraduates(updated);

    try {
      const res = await fetch('/api/data/graduates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', data: grad })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_graduates', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_graduates', updated);
      return true;
    }
  };

  const updateGraduate = async (id: string, fields: Partial<Graduate>): Promise<boolean> => {
    const updated = graduates.map(g => (g.id === id ? { ...g, ...fields } : g)).sort((a, b) => a.order - b.order);
    setGraduates(updated);

    try {
      const res = await fetch('/api/data/graduates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id, fields })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_graduates', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_graduates', updated);
      return true;
    }
  };

  const deleteGraduate = async (id: string): Promise<boolean> => {
    const updated = graduates.filter(g => g.id !== id);
    setGraduates(updated);

    try {
      const res = await fetch('/api/data/graduates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_graduates', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_graduates', updated);
      return true;
    }
  };

  const importGraduatesCsv = async (list: Graduate[]): Promise<boolean> => {
    setGraduates(list);
    try {
      const res = await fetch('/api/data/graduates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', list })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_graduates', list);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_graduates', list);
      return true;
    }
  };

  const reorderGraduates = async (orderedGrads: Graduate[]): Promise<boolean> => {
    const updated = orderedGrads.map((g, idx) => ({ ...g, order: idx + 1 }));
    setGraduates(updated);

    try {
      const res = await fetch('/api/data/graduates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', list: updated })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_graduates', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_graduates', updated);
      return true;
    }
  };

  // 4. Message Actions
  const submitMessage = async (msg: Omit<Message, 'id' | 'status' | 'createdAt'>): Promise<boolean> => {
    const newMsg: Message = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);

    try {
      const res = await fetch('/api/data/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', data: newMsg })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_messages', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_messages', updated);
      return true;
    }
  };

  const approveMessage = async (id: string): Promise<boolean> => {
    const updated = messages.map(m => (m.id === id ? { ...m, status: 'approved' as const } : m));
    setMessages(updated);

    try {
      const res = await fetch('/api/data/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_messages', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_messages', updated);
      return true;
    }
  };

  const rejectMessage = async (id: string): Promise<boolean> => {
    const updated = messages.map(m => (m.id === id ? { ...m, status: 'rejected' as const } : m));
    setMessages(updated);

    try {
      const res = await fetch('/api/data/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', id })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_messages', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_messages', updated);
      return true;
    }
  };

  const deleteMessage = async (id: string): Promise<boolean> => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);

    try {
      const res = await fetch('/api/data/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_messages', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_messages', updated);
      return true;
    }
  };

  // 5. Photo Actions
  const submitPhoto = async (photo: Omit<Photo, 'id' | 'status' | 'createdAt'>): Promise<boolean> => {
    const newPhoto: Photo = {
      ...photo,
      id: `photo-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const updated = [newPhoto, ...photos];
    setPhotos(updated);

    try {
      const res = await fetch('/api/data/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', data: newPhoto })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_photos', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_photos', updated);
      return true;
    }
  };

  const approvePhoto = async (id: string): Promise<boolean> => {
    const updated = photos.map(p => (p.id === id ? { ...p, status: 'approved' as const } : p));
    setPhotos(updated);

    try {
      const res = await fetch('/api/data/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', id })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_photos', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_photos', updated);
      return true;
    }
  };

  const rejectPhoto = async (id: string): Promise<boolean> => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);

    try {
      const res = await fetch('/api/data/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', id })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_photos', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_photos', updated);
      return true;
    }
  };

  const deletePhoto = async (id: string): Promise<boolean> => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);

    try {
      const res = await fetch('/api/data/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_photos', updated);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_photos', updated);
      return true;
    }
  };

  // 6. Media Links Actions
  const updateMediaLinks = async (links: MediaLinks): Promise<boolean> => {
    setMediaLinks(links);
    try {
      const res = await fetch('/api/data/media-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: links })
      });
      const result = await res.json();
      if (result.localOnly) {
        saveLocal('dgci_media_links', links);
      }
      return result.success;
    } catch (e) {
      console.error(e);
      saveLocal('dgci_media_links', links);
      return true;
    }
  };

  return (
    <DataContext.Provider
      value={{
        ceremonyInfo,
        program,
        graduates,
        messages,
        photos,
        mediaLinks,
        journey,
        isLoading,
        isSupabaseMode: isSupabaseConfigured,
        dbSource,
        isAdmin,
        refreshData,
        loginAdmin,
        logoutAdmin,
        updateCeremonyInfo,
        addProgramItem,
        updateProgramItem,
        deleteProgramItem,
        reorderProgram,
        addGraduate,
        updateGraduate,
        deleteGraduate,
        importGraduatesCsv,
        reorderGraduates,
        submitMessage,
        approveMessage,
        rejectMessage,
        deleteMessage,
        submitPhoto,
        approvePhoto,
        rejectPhoto,
        deletePhoto,
        updateMediaLinks
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
