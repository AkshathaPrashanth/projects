
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sidebar } from './components/Sidebar';
import { Send, Sparkles, Terminal, FileUp, X, Check, Globe, Copy, Download } from 'lucide-react';
import { Message, ChatSession, Attachment } from './types';
import { generateAuraResponse } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('aura_sessions_v3');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    const lastSession = localStorage.getItem('aura_last_session');
    return lastSession || '';
  });

  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // Persistence
  useEffect(() => {
    localStorage.setItem('aura_sessions_v3', JSON.stringify(sessions));
    if (currentSessionId) {
      localStorage.setItem('aura_last_session', currentSessionId);
    }
  }, [sessions, currentSessionId]);

  // Handle Shared Link
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#chat=')) {
      try {
        const encodedData = hash.replace('#chat=', '');
        const decodedData = JSON.parse(atob(decodeURIComponent(encodedData)));
        if (Array.isArray(decodedData)) {
          // Import shared chat as a new session
          const newId = 'shared-' + Date.now();
          const newSession: ChatSession = {
            id: newId,
            title: 'Shared Session',
            messages: decodedData,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          setSessions(prev => [newSession, ...prev]);
          setCurrentSessionId(newId);
          window.location.hash = ''; // Clear hash
        }
      } catch (e) {
        console.error("Failed to decode shared chat", e);
      }
    } else if (sessions.length === 0) {
      handleNewChat();
    }
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleNewChat = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newSession: ChatSession = {
      id: newId,
      title: 'New Neural Link',
      messages: [{
        id: 'welcome',
        role: 'assistant',
        content: 'Aura AI is online. I am your high-performance synthetic assistant. Upload any file or send a command to begin.',
        timestamp: Date.now()
      }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newId);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const newAttachment: Attachment = {
          name: file.name,
          type: file.type,
          data: isImage ? base64 : (event.target?.result as string),
          isImage
        };
        
        if (!isImage) {
          const textReader = new FileReader();
          textReader.onload = (tEvent) => {
            setPendingAttachments(prev => [...prev, {
              ...newAttachment,
              data: tEvent.target?.result as string
            }]);
          };
          textReader.readAsText(file);
        } else {
          setPendingAttachments(prev => [...prev, newAttachment]);
        }
      };
      
      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && pendingAttachments.length === 0) || isThinking || !currentSessionId) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    };

    // Update current session with user message and generate title if needed
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newTitle = s.messages.length <= 1 && input.trim() ? input.substring(0, 30) + (input.length > 30 ? '...' : '') : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMsg],
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    const currentInput = input;
    const currentAttachments = [...pendingAttachments];
    const previousMessages = [...messages, userMsg];
    
    setInput('');
    setPendingAttachments([]);
    setIsThinking(true);

    try {
      const response = await generateAuraResponse(currentInput, previousMessages, [], currentAttachments);
      const assistantMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: response || "Analysis complete. No output generated.",
        timestamp: Date.now()
      };
      
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, assistantMsg],
            updatedAt: Date.now()
          };
        }
        return s;
      }));
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: 'System error: Neural link failed. Please retry your request.',
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, errorMsg] } : s));
    } finally {
      setIsThinking(false);
    }
  };

  const exportTranscript = () => {
    if (!messages.length) return;
    const transcript = messages.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}:\n${m.content}\n`).join('\n---\n');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aura_AI_Transcript_${currentSession?.title.replace(/\s+/g, '_') || 'Chat'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareChat = () => {
    const chatData = JSON.stringify(messages);
    const encoded = btoa(encodeURIComponent(chatData));
    const url = `${window.location.origin}${window.location.pathname}#chat=${encoded}`;
    navigator.clipboard.writeText(url);
    setShareStatus('copied');
    setTimeout(() => setShareStatus('idle'), 2000);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) {
      setCurrentSessionId(updated[0]?.id || '');
    }
  };

  return (
    <div className="flex h-screen bg-black text-zinc-100 overflow-hidden font-sans">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={handleNewChat}
        onDeleteSession={deleteSession}
        onExportTranscript={exportTranscript}
        onShareChat={shareChat}
        onClearAll={() => {
          if (confirm('Are you sure you want to purge all archives?')) {
            setSessions([]);
            setCurrentSessionId('');
            handleNewChat();
          }
        }}
      />

      <main className="flex-1 flex flex-col relative bg-black">
        {/* Header */}
        <header className="h-16 border-b border-zinc-900 bg-black/80 backdrop-blur-xl flex items-center justify-between px-8 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 aura-glow">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-white">
                {currentSession?.title || 'Aura AI'}
              </h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.8)]"></div>
              Neural Link: Active
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-violet-400 transition-colors" onClick={exportTranscript}>
              <Download className="w-3 h-3" />
              Download Log
            </div>
          </div>
        </header>

        {/* Scrollable Chat Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-3xl mx-auto px-6 py-12 space-y-12 min-h-full">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`group flex w-full flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4`}
              >
                <div className={`flex gap-4 max-w-full ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                    msg.role === 'user' ? 'bg-zinc-900 border-zinc-800' : 'bg-violet-600/10 border-violet-500/30'
                  }`}>
                    {msg.role === 'user' ? <Terminal className="w-3.5 h-3.5 text-zinc-500" /> : <Sparkles className="w-3.5 h-3.5 text-violet-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`p-5 rounded-2xl border transition-all ${
                      msg.role === 'user' 
                        ? 'bg-zinc-900 border-zinc-800 text-zinc-200' 
                        : 'bg-[#0a0a0a] border-zinc-900 text-zinc-300 shadow-xl'
                    }`}>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {msg.attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 bg-black/40 border border-zinc-800 rounded-lg text-[10px] text-zinc-400 font-mono">
                              <FileUp className="w-3 h-3 text-violet-400" />
                              {att.name}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="prose max-w-none prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    
                    <div className={`mt-2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] font-mono text-zinc-700 uppercase">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(msg.content);
                          setCopiedId(msg.id);
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-1 hover:bg-zinc-900 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="flex gap-4 w-full">
                  <div className="w-8 h-8 rounded-lg bg-violet-600/10 border border-violet-500/30 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                  <div className="p-5 rounded-2xl bg-[#0a0a0a] border border-zinc-900 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></div>
                    <span className="text-[10px] font-mono text-zinc-600 uppercase ml-2 tracking-widest">Synthesizing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-32 w-full invisible pointer-events-none" />
          </div>
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
          <div className="max-w-3xl mx-auto space-y-4 pointer-events-auto">
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 px-2 animate-in slide-in-from-bottom-2 fade-in">
                {pendingAttachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-violet-500/20 rounded-full text-xs text-zinc-300">
                    <span className="truncate max-w-[150px]">{att.name}</span>
                    <button onClick={() => setPendingAttachments(prev => prev.filter((_, i) => i !== idx))} className="hover:text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-900/40 to-cyan-900/40 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-700"></div>
              <div className="relative flex items-center bg-[#0a0a0a] border border-zinc-800 rounded-2xl p-2.5 pl-4 shadow-2xl focus-within:border-violet-500/30 transition-all">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  multiple 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 text-zinc-500 hover:text-violet-400 hover:bg-violet-500/5 rounded-xl transition-all"
                >
                  <FileUp className="w-5 h-5" />
                </button>
                <textarea 
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask Aura AI anything..."
                  className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-700 py-3 px-3 text-sm resize-none scrollbar-hide max-h-32"
                />
                <button 
                  type="submit"
                  disabled={(!input.trim() && pendingAttachments.length === 0) || isThinking}
                  className={`p-3 rounded-xl transition-all ${
                    (input.trim() || pendingAttachments.length > 0) && !isThinking 
                      ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/20' 
                      : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
