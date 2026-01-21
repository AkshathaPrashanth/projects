
export interface Color {
  hex: string;
  rgb: [number, number, number];
  locked?: boolean;
}

export interface PatternHistoryItem {
  id: string;
  imageUrl: string; 
  prompt: string;
  timestamp: number;
  palette: Color[];
  author?: string;
  likes?: number;
  referenceMockupUrl?: string; 
  fullViewMockupUrl?: string;
}

export type FabricType = 'cotton' | 'silk' | 'canvas' | 'none';
export type RepeatMode = 'grid' | 'brick' | 'half-drop';
export type ViewMode = 'landing' | 'workspace' | 'library' | 'gallery' | 'admin' | 'auth' | 'console' | 'architecture';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'designer' | 'admin';
  avatar?: string;
  lastLogin?: number;
  emailVerified?: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  detail: string;
  timestamp: number;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface GenerationSettings {
  prompt: string;
  scale: number;
  rotation: number;
  fabricType: FabricType;
  repeatMode: RepeatMode;
  referenceImage?: string;
}

export interface AppState {
  currentPattern: PatternHistoryItem | null;
  history: PatternHistoryItem[];
  isGenerating: boolean;
  settings: GenerationSettings;
  error: string | null;
  currentUser: User | null;
}