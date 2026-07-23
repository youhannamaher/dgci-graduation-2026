export interface CeremonyInfo {
  title: string;
  classYear: string;
  date: string;
  time: string;
  venue: string;
  locationUrl: string;
  subtitle: string;
  closingMessage: string;
  whatsappNumber?: string;
}

export interface ProgramItem {
  id: string;
  order: number;
  time: string;
  durationMinutes?: number;
  actualStartTime?: string;
  title: string;
  description: string;
  isCurrent: boolean;
}

export interface Graduate {
  id: string;
  order: number;
  fullName: string;
  displayName: string;
  photo: string;
  quote: string;
  linkedin: string;
  instagram: string;
  showProfile: boolean;
  isHighestHonors?: boolean;
  honorsOrder?: number;
  bourse?: string;
  masterProgram?: string;
}

export interface Message {
  id: string;
  message: string;
  senderName: string;
  isAnonymous: boolean;
  targetType: 'class' | 'graduate';
  targetGraduateIds: string[]; // slug IDs of graduates
  relation: string; // Friend, Family, Professor, Guest, Graduate
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export interface MediaLinks {
  officialPhotosUrl: string;
  recapVideoUrl: string;
  fullCeremonyUrl: string;
}

export interface JourneyItem {
  year: string;
  title: string;
  description: string;
  isComingSoon: boolean;
}
