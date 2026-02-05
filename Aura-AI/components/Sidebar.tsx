
import React from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Download, 
  Share2, 
  History,
  Sparkles
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onExportTranscript: () => void;
  onShareChat: () => void;
  onClearAll: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onExportTranscript,
  onShareChat,
  onClearAll
}) => {
  return (
    <aside className="w-72 bg-[#050505] border-r border-zinc-900 flex flex-col h-full z-30">
      {/* Brand & New Chat */}
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center border border-violet-500/30">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <h1 className="text-lg font-bold tracking-tighter text-white">Aura AI</h1>
        </div>
        
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-xl transition-all border border-zinc-800 text-sm font-medium group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          New Neural Link
        </button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 mb-2 flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          <History className="w-3 h-3" />
          Neural Logs
        </div>
        
        {sessions.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-zinc-700 italic">No active logs detected.</p>
          </div>
        ) : (
          sessions.map(session => (
            <div 
              key={session.id}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer border ${
                currentSessionId === session.id 
                  ? 'bg-violet-600/10 border-violet-500/20 text-violet-100' 
                  : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare className={`w-4 h-4 shrink-0 ${currentSessionId === session.id ? 'text-violet-400' : 'text-zinc-700'}`} />
              <span className="text-sm truncate flex-1 font-medium">{session.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Utility Actions */}
      <div className="p-4 border-t border-zinc-900 space-y-2">
        <button 
          onClick={onExportTranscript}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all text-sm font-medium group"
        >
          <Download className="w-4 h-4 text-zinc-600 group-hover:text-violet-400" />
          Export Transcript
        </button>
        <button 
          onClick={onShareChat}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-all text-sm font-medium group"
        >
          <Share2 className="w-4 h-4 text-zinc-600 group-hover:text-violet-400" />
          Share Session
        </button>
        <div className="pt-2">
          <button 
            onClick={onClearAll}
            className="w-full flex items-center gap-3 px-4 py-2 text-zinc-700 hover:text-red-400 transition-all text-xs font-mono uppercase tracking-tighter"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge All Archives
          </button>
        </div>
      </div>
    </aside>
  );
};
