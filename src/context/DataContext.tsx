'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

// Direct JSON template imports for instant local fallbacks
import infoTemplate from '../../data/ceremony-info.json';
import progTemplate from '../../data/program.json';
import gradsTemplate from '../../data/graduates.json';
import galleryTemplate from '../../data/gallery.json';
import msgTemplate from '../../data/messages.json';
import mediaTemplate from '../../data/media-links.json';
import journeyTemplate from '../../data/journey.json';
import {
  CeremonyInfo,
  ProgramItem,
  Graduate,
  Message,
  Photo,
  MediaLinks,
  JourneyItem
} from '@/lib/types';

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
  isAdmin: boolean;
  
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

// Mappers for Supabase integration
const mapGradDbToClient = (g: any): Graduate => ({
  id: g.id,
  order: g.order_number,
  fullName: g.full_name,
  displayName: g.display_name,
  photo: g.photo_url || '',
  quote: g.quote || '',
  linkedin: g.linkedin || '',
  instagram: g.instagram || '',
  showProfile: g.show_profile ?? true
});

const mapGradClientToDb = (g: Graduate) => ({
  id: g.id,
  order_number: g.order,
  full_name: g.fullName,
  display_name: g.displayName,
  photo_url: g.photo,
  quote: g.quote,
  linkedin: g.linkedin,
  instagram: g.instagram,
  show_profile: g.showProfile
});

const mapProgDbToClient = (p: any): ProgramItem => ({
  id: p.id,
  order: p.item_order,
  time: p.time,
  title: p.title,
  description: p.description || '',
  isCurrent: p.is_current ?? false
});

const mapProgClientToDb = (p: ProgramItem) => ({
  id: p.id,
  item_order: p.order,
  time: p.time,
  title: p.title,
  description: p.description,
  is_current: p.isCurrent
});

const mapMsgDbToClient = (m: any): Message => {
  let graduateIds: string[] = [];
  try {
    if (Array.isArray(m.target_graduate_ids)) {
      graduateIds = m.target_graduate_ids;
    } else if (typeof m.target_graduate_ids === 'string') {
      graduateIds = JSON.parse(m.target_graduate_ids);
    } else if (m.target_graduate_ids && typeof m.target_graduate_ids === 'object') {
      graduateIds = Object.values(m.target_graduate_ids);
    }
  } catch (e) {
    console.error('Error parsing target_graduate_ids', e);
  }

  return {
    id: m.id,
    message: m.message,
    senderName: m.sender_name || 'Anonymous',
    isAnonymous: m.is_anonymous ?? false,
    targetType: m.target_type as 'class' | 'graduate',
    targetGraduateIds: graduateIds,
    relation: m.relation || 'Guest',
    status: m.status as 'pending' | 'approved' | 'rejected',
    createdAt: m.created_at
  };
};

const mapMsgClientToDb = (m: any) => ({
  id: m.id,
  message: m.message,
  sender_name: m.senderName,
  is_anonymous: m.isAnonymous,
  target_type: m.targetType,
  target_graduate_ids: m.targetGraduateIds,
  relation: m.relation,
  status: m.status
});

const mapPhotoDbToClient = (p: any): Photo => ({
  id: p.id,
  url: p.url,
  caption: p.caption || '',
  uploadedBy: p.uploaded_by || 'Anonymous',
  status: p.status as 'pending' | 'approved',
  createdAt: p.created_at
});

const mapPhotoClientToDb = (p: Photo) => ({
  id: p.id,
  url: p.url,
  caption: p.caption,
  uploaded_by: p.uploadedBy,
  status: p.status
});

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ceremonyInfo, setCeremonyInfo] = useState<CeremonyInfo>({
    title: 'DGCI Graduation Ceremony',
    classYear: '2026',
    date: 'Sunday, July 26, 2026',
    time: '6:00 PM',
    venue: 'The Glass House',
    locationUrl: '',
    subtitle: 'The Graduating Class of 2026 would like to invite you to their Graduation Ceremony',
    closingMessage: 'Your presence will honor this special milestone.'
  });
  const [program, setProgram] = useState<ProgramItem[]>([]);
  const [graduates, setGraduates] = useState<Graduate[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [mediaLinks, setMediaLinks] = useState<MediaLinks>({
    officialPhotosUrl: '',
    recapVideoUrl: '',
    fullCeremonyUrl: ''
  });
  const [journey, setJourney] = useState<JourneyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

// Timeout utility to protect client against hanging database requests
function withTimeout<T>(promise: Promise<T>, ms = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase request timed out')), ms)
    )
  ]);
}

  // Main loader
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // Load static journey template directly
        setJourney(journeyTemplate as JourneyItem[]);

        if (isSupabaseConfigured && supabase) {
          console.log('Supabase mode active. Loading from database...');
          
          // Fetch all data in parallel under a 4-second timeout limit
          const [gradsRes, progRes, msgRes, photoRes, mediaRes] = await withTimeout(
            Promise.all([
              supabase.from('graduates').select('*').order('order_number', { ascending: true }),
              supabase.from('program_items').select('*').order('item_order', { ascending: true }),
              supabase.from('messages').select('*').order('created_at', { ascending: false }),
              supabase.from('photos').select('*').order('created_at', { ascending: false }),
              supabase.from('media_links').select('*')
            ]),
            4000
          );

          const gradsDb = gradsRes.data;
          const gradsErr = gradsRes.error;
          const progDb = progRes.data;
          const progErr = progRes.error;
          const msgDb = msgRes.data;
          const msgErr = msgRes.error;
          const photoDb = photoRes.data;
          const photoErr = photoRes.error;
          const mediaDb = mediaRes.data;
          const mediaErr = mediaRes.error;

          if (gradsErr || progErr || msgErr || photoErr || mediaErr) {
            console.warn('Error fetching from Supabase, falling back to local files:', { gradsErr, progErr, msgErr, photoErr, mediaErr });
            await loadLocalDataWithLocalStorage();
          } else {
            // Check if DB is empty. If graduates are empty, let's seed the tables!
            if (!gradsDb || gradsDb.length === 0) {
              console.log('Supabase is empty. Seeding with local files...');
              await seedSupabaseFromLocal();
            } else {
              setGraduates(gradsDb.map(mapGradDbToClient));
              setProgram(progDb!.map(mapProgDbToClient));
              setMessages(msgDb!.map(mapMsgDbToClient));
              setPhotos(photoDb!.map(mapPhotoDbToClient));
              
              // Set media links and ceremony info
              const links: MediaLinks = { officialPhotosUrl: '', recapVideoUrl: '', fullCeremonyUrl: '' };
              let info = { ...ceremonyInfo };

              mediaDb?.forEach(item => {
                if (item.type === 'photos') links.officialPhotosUrl = item.url;
                if (item.type === 'video_recap') links.recapVideoUrl = item.url;
                if (item.type === 'video_full') links.fullCeremonyUrl = item.url;
                if (item.type === 'ceremony_info') {
                  try {
                    info = JSON.parse(item.url);
                  } catch (e) {
                    console.error('Failed parsing ceremony info from DB', e);
                  }
                }
              });

              setMediaLinks(links);
              setCeremonyInfo(info);
            }
          }
        } else {
          console.log('Local Mode active. Loading from files...');
          await loadLocalDataWithLocalStorage();
        }
      } catch (e) {
        console.error('Failed to load data, using local storage overrides:', e);
        await loadLocalDataWithLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Helper: Seed Supabase if it's connected but empty
  const seedSupabaseFromLocal = async () => {
    if (!supabase) return;

    try {
      const infoData = infoTemplate as CeremonyInfo;
      const progData = progTemplate as ProgramItem[];
      const gradsData = gradsTemplate as Graduate[];
      const galleryData = galleryTemplate as Photo[];
      const msgData = msgTemplate as Message[];
      const mediaData = mediaTemplate as MediaLinks;

      setCeremonyInfo(infoData);
      setProgram(progData);
      setGraduates(gradsData);
      setPhotos(galleryData);
      setMessages(msgData);
      setMediaLinks(mediaData);

      console.log('Seeding Supabase tables with local files...');
      
      // Batch inserts
      await supabase.from('graduates').upsert(gradsData.map(mapGradClientToDb));
      await supabase.from('program_items').upsert(progData.map(mapProgClientToDb));
      await supabase.from('messages').upsert(msgData.map(mapMsgClientToDb));
      await supabase.from('photos').upsert(galleryData.map(mapPhotoClientToDb));
      
      // Insert media links + ceremony info
      await supabase.from('media_links').upsert([
        { id: 'photos', title: 'Official Photos', type: 'photos', url: mediaData.officialPhotosUrl, is_active: true },
        { id: 'video_recap', title: 'Recap Video', type: 'video_recap', url: mediaData.recapVideoUrl, is_active: true },
        { id: 'video_full', title: 'Full Ceremony Video', type: 'video_full', url: mediaData.fullCeremonyUrl, is_active: true },
        { id: 'ceremony_info', title: 'Ceremony Info', type: 'ceremony_info', url: JSON.stringify(infoData), is_active: true }
      ]);

      console.log('Supabase successfully seeded!');
    } catch (e) {
      console.error('Failed to seed Supabase database:', e);
    }
  };

  // Helper: Load local json templates + apply localStorage changes
  const loadLocalDataWithLocalStorage = async () => {
    try {
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
    } catch (e) {
      console.error('Error loading fallback local data', e);
    }
  };

  // Helper: save to local storage
  const saveLocal = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  };

  // --- WRITE ACTIONS ---

  // 1. Ceremony Info
  const updateCeremonyInfo = async (info: CeremonyInfo): Promise<boolean> => {
    setCeremonyInfo(info);
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('media_links').upsert({
        id: 'ceremony_info',
        title: 'Ceremony Info',
        type: 'ceremony_info',
        url: JSON.stringify(info),
        is_active: true
      });
      return !error;
    } else {
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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('program_items').insert(mapProgClientToDb(newItem));
      return !error;
    } else {
      saveLocal('dgci_program', updated);
      return true;
    }
  };

  const updateProgramItem = async (id: string, fields: Partial<ProgramItem>): Promise<boolean> => {
    const updated = program.map(item => {
      if (item.id === id) {
        // If setting this item as current, un-current the others
        return { ...item, ...fields };
      }
      if (fields.isCurrent && item.id !== id) {
        return { ...item, isCurrent: false };
      }
      return item;
    }).sort((a, b) => a.order - b.order);
    
    setProgram(updated);

    if (isSupabaseConfigured && supabase) {
      const target = updated.find(x => x.id === id);
      if (!target) return false;

      if (fields.isCurrent) {
        // Clear all current status first in Supabase
        await supabase.from('program_items').update({ is_current: false }).neq('id', id);
      }

      const { error } = await supabase.from('program_items').update(mapProgClientToDb(target)).eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_program', updated);
      return true;
    }
  };

  const deleteProgramItem = async (id: string): Promise<boolean> => {
    const updated = program.filter(item => item.id !== id);
    setProgram(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('program_items').delete().eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_program', updated);
      return true;
    }
  };

  const reorderProgram = async (items: ProgramItem[]): Promise<boolean> => {
    // Re-assign order indices based on position
    const ordered = items.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));
    setProgram(ordered);

    if (isSupabaseConfigured && supabase) {
      try {
        const client = supabase;
        const promises = ordered.map(item =>
          client.from('program_items').update({ item_order: item.order }).eq('id', item.id)
        );
        await Promise.all(promises);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } else {
      saveLocal('dgci_program', ordered);
      return true;
    }
  };

  // 3. Graduate Actions
  const addGraduate = async (grad: Graduate): Promise<boolean> => {
    const updated = [...graduates, grad].sort((a, b) => a.order - b.order);
    setGraduates(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('graduates').insert(mapGradClientToDb(grad));
      return !error;
    } else {
      saveLocal('dgci_graduates', updated);
      return true;
    }
  };

  const updateGraduate = async (id: string, fields: Partial<Graduate>): Promise<boolean> => {
    const updated = graduates.map(g => (g.id === id ? { ...g, ...fields } : g)).sort((a, b) => a.order - b.order);
    setGraduates(updated);

    if (isSupabaseConfigured && supabase) {
      const target = updated.find(x => x.id === id);
      if (!target) return false;
      const { error } = await supabase.from('graduates').update(mapGradClientToDb(target)).eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_graduates', updated);
      return true;
    }
  };

  const deleteGraduate = async (id: string): Promise<boolean> => {
    const updated = graduates.filter(g => g.id !== id);
    setGraduates(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('graduates').delete().eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_graduates', updated);
      return true;
    }
  };

  const importGraduatesCsv = async (list: Graduate[]): Promise<boolean> => {
    setGraduates(list);
    if (isSupabaseConfigured && supabase) {
      // Clear existing first
      await supabase.from('graduates').delete().neq('id', 'dummy');
      // Insert new
      const { error } = await supabase.from('graduates').insert(list.map(mapGradClientToDb));
      return !error;
    } else {
      saveLocal('dgci_graduates', list);
      return true;
    }
  };

  const reorderGraduates = async (orderedGrads: Graduate[]): Promise<boolean> => {
    const updated = orderedGrads.map((g, idx) => ({ ...g, order: idx + 1 }));
    setGraduates(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const client = supabase;
        const promises = updated.map(g =>
          client.from('graduates').update({ order_number: g.order }).eq('id', g.id)
        );
        await Promise.all(promises);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } else {
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
    
    // Add to state
    const updated = [newMsg, ...messages];
    setMessages(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('messages').insert(mapMsgClientToDb(newMsg));
      return !error;
    } else {
      saveLocal('dgci_messages', updated);
      return true;
    }
  };

  const approveMessage = async (id: string): Promise<boolean> => {
    const updated = messages.map(m => (m.id === id ? { ...m, status: 'approved' as const } : m));
    setMessages(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('messages').update({ status: 'approved' }).eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_messages', updated);
      return true;
    }
  };

  const rejectMessage = async (id: string): Promise<boolean> => {
    const updated = messages.map(m => (m.id === id ? { ...m, status: 'rejected' as const } : m));
    setMessages(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('messages').update({ status: 'rejected' }).eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_messages', updated);
      return true;
    }
  };

  const deleteMessage = async (id: string): Promise<boolean> => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      return !error;
    } else {
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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('photos').insert(mapPhotoClientToDb(newPhoto));
      return !error;
    } else {
      saveLocal('dgci_photos', updated);
      return true;
    }
  };

  const approvePhoto = async (id: string): Promise<boolean> => {
    const updated = photos.map(p => (p.id === id ? { ...p, status: 'approved' as const } : p));
    setPhotos(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('photos').update({ status: 'approved' }).eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_photos', updated);
      return true;
    }
  };

  const rejectPhoto = async (id: string): Promise<boolean> => {
    // We can delete or set to a different status, let's filter/delete for rejection of photos
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('photos').delete().eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_photos', updated);
      return true;
    }
  };

  const deletePhoto = async (id: string): Promise<boolean> => {
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('photos').delete().eq('id', id);
      return !error;
    } else {
      saveLocal('dgci_photos', updated);
      return true;
    }
  };

  // 6. Media Links Actions
  const updateMediaLinks = async (links: MediaLinks): Promise<boolean> => {
    setMediaLinks(links);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('media_links').upsert({ id: 'photos', title: 'Official Photos', type: 'photos', url: links.officialPhotosUrl, is_active: true });
        await supabase.from('media_links').upsert({ id: 'video_recap', title: 'Recap Video', type: 'video_recap', url: links.recapVideoUrl, is_active: true });
        await supabase.from('media_links').upsert({ id: 'video_full', title: 'Full Ceremony Video', type: 'video_full', url: links.fullCeremonyUrl, is_active: true });
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } else {
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
        isAdmin,
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
