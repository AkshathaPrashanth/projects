
export interface Attachment {
  name: string;
  type: string;
  data: string; // base64 or text content
  isImage: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface KnowledgeItem {
  title: string;
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  sessions: ChatSession[];
  currentSessionId: string;
  isThinking: boolean;
}
