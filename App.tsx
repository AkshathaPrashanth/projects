import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import PatternCanvas from './components/PatternCanvas';
import ToolsPanel from './components/ToolsPanel';
import Library from './components/Library';
import Gallery from './components/Gallery';
import AdminDashboard from './components/AdminDashboard';
import LogMonitor from './components/LogMonitor';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import { SettingsModal, AccountModal } from './components/Modals';
import { generateSeamlessPattern, applyPatternToImage, generateFullGarmentMockup } from './services/geminiService';
import { db } from './services/databaseService';
import { PatternHistoryItem as PatternHistoryItemType, FabricType, RepeatMode, ViewMode, User, Color } from './types';
import { INITIAL_PROMPT as INIT_PROMPT } from './constants';
import { Wand2, SlidersHorizontal } from 'lucide-react';

const DEFAULT_GUEST: User = {
  id: `guest-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Guest Designer',
  email: 'guest@fashion.ai',
  role: 'designer',
  avatar: ''
};

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('landing');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPattern, setCurrentPattern] = useState<PatternHistoryItemType | null>(null);
  const [workingPalette, setWorkingPalette] = useState<Color[]>([]);
  const [history, setHistory] = useState<PatternHistoryItemType[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(INIT_PROMPT);
  const [scale, setScale] = useState<number>(0.5);
  const [rotation, setRotation] = useState<number>(0);
  const [fabricType, setFabricType] = useState<FabricType>('none');
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('grid');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  const [showLeftPanel, setShowLeftPanel] = useState(window.innerWidth > 1024);
  const [showRightPanel, setShowRightPanel] = useState(window.innerWidth > 1280);

  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const isHeadlessConsole = useMemo(() => urlParams.get('view') === 'console', [urlParams]);
  const isWorkspaceDirect = useMemo(() => urlParams.get('view') === 'workspace', [urlParams]);

  useEffect(() => {
    if (activeView === 'landing' || activeView === 'auth') return;
    const workspaceState = {
      prompt,
      scale,
      rotation,
      fabricType,
      repeatMode,
      currentPatternId: currentPattern?.id,
      workingPalette
    };
    localStorage.setItem('fd_workspace_state', JSON.stringify(workspaceState));
  }, [prompt, scale, rotation, fabricType, repeatMode, currentPattern, workingPalette, activeView]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const rememberedUser = localStorage.getItem('fd_ai_session');
        let userToUse = DEFAULT_GUEST;
        
        if (rememberedUser) {
          userToUse = JSON.parse(rememberedUser);
        }
        
        setCurrentUser(userToUse);
        
        const [savedPatterns, stats] = await Promise.all([
          db.getPatterns(),
          db.getStats()
        ]);
        
        setHistory(savedPatterns || []);

        const savedWorkspaceRaw = localStorage.getItem('fd_workspace_state');
        if (savedWorkspaceRaw) {
          const ws = JSON.parse(savedWorkspaceRaw);
          setPrompt(ws.prompt ?? INIT_PROMPT);
          setScale(ws.scale ?? 0.5);
          setRotation(ws.rotation ?? 0);
          setFabricType(ws.fabricType ?? 'none');
          setRepeatMode(ws.repeatMode ?? 'grid');
          setWorkingPalette(ws.workingPalette ?? []);
          
          if (ws.currentPatternId) {
             const found = savedPatterns.find((p: any) => p.id === ws.currentPatternId);
             if (found) setCurrentPattern(found);
          }
        }
        
        if (isHeadlessConsole) {
          setActiveView('console');
        } else if (isWorkspaceDirect) {
          setActiveView('workspace');
        } else if (rememberedUser) {
          setActiveView('workspace');
        } else {
          setActiveView('landing');
        }

        db.logActivity(userToUse.id, userToUse.name, 'Session Hydrated', `Environment: ${stats.dbStatus}`, 'info');
      } catch (e) {
        console.error("Hydration failed", e);
        setCurrentUser(DEFAULT_GUEST);
        setActiveView('landing');
      }
    };
    initApp();

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setShowLeftPanel(window.innerWidth > 1024);
        setShowRightPanel(window.innerWidth > 1280);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isHeadlessConsole, isWorkspaceDirect]);

  const handleLaunchStudio = () => {
    setActiveView('workspace');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'workspace');
      window.history.replaceState({}, '', url.pathname + url.search);
    } catch (e) {}
  };

  const handleLaunchConsole = () => {
    const relativeUrl = '?view=console';
    window.open(relativeUrl, 'Console', 'width=1000,height=700,menubar=no,toolbar=no,location=no,status=no');
  };

  const handleCopyAppUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.search = 'view=workspace';
      navigator.clipboard.writeText(url.href);
      alert("🚀 Studio Link Copied!");
    } catch (e) {
      alert("Failed to copy URL.");
    }
  };

  const handleDownloadShortcut = (os: 'win' | 'mac') => {
    try {
      const url = new URL(window.location.href);
      url.search = 'view=workspace';
      const directUrl = url.href;
      let content = os === 'win' ? `[InternetShortcut]\nURL=${directUrl}` : `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n\t<key>URL</key>\n\t<string>${directUrl}</string>\n</dict>\n</plist>`;
      const blob = new Blob([content], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `FashionDesignAI.${os === 'win' ? 'url' : 'webloc'}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {}
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLoginSuccess = async (role: 'designer' | 'admin', name: string, email: string) => {
    const loggedInUser: User = {
      id: role === 'admin' ? 'admin-root' : `user-${Date.now()}`,
      name, email, role, avatar: '', lastLogin: Date.now()
    };
    setCurrentUser(loggedInUser);
    localStorage.setItem('fd_ai_session', JSON.stringify(loggedInUser));
    await db.saveUser(loggedInUser);
    setActiveView(role === 'admin' ? 'admin' : 'workspace');
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('fd_ai_session', JSON.stringify(updatedUser));
    await db.saveUser(updatedUser);
    db.logActivity(updatedUser.id, updatedUser.name, 'Profile Updated', 'User changed credentials', 'success');
  };

  const handleLogout = async () => {
    localStorage.removeItem('fd_ai_session');
    localStorage.removeItem('fd_workspace_state'); 
    setCurrentUser(DEFAULT_GUEST);
    setActiveView('landing');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.pushState({}, '', url.pathname);
    } catch (e) {}
  };

  const handleGenerate = useCallback(async (refImage?: string) => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const lockedColors = workingPalette.filter(c => c.locked).map(c => c.hex);
      const result = await generateSeamlessPattern(prompt, refImage, lockedColors);
      const mergedPalette = [...workingPalette.filter(c => c.locked), ...(result.palette || []).filter(c => !lockedColors.includes(c.hex))].slice(0, 6);
      result.palette = mergedPalette;
      setWorkingPalette(mergedPalette);
      
      setCurrentPattern(result);
      setHistory(prev => [result, ...prev]);
      db.savePattern(result);
      
      const [fullViewUrl, mockupUrl] = await Promise.all([
        generateFullGarmentMockup(result.imageUrl),
        refImage ? applyPatternToImage(result.imageUrl, refImage) : Promise.resolve("")
      ]);
      
      const updatedResult = { ...result, fullViewMockupUrl: fullViewUrl, referenceMockupUrl: mockupUrl };
      setCurrentPattern(updatedResult);
      setHistory(prev => prev.map(p => p.id === result.id ? updatedResult : p));
      db.savePattern(updatedResult);
      
      if (currentUser) db.logActivity(currentUser.id, currentUser.name, 'Design Saved', `Asset ID: ${result.id.substring(0,8)}`, 'success');
    } catch (err: any) {
      setError(err.message || "Engine Error");
      db.logActivity('system-error', 'CRITICAL', 'Generation Failed', err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, currentUser, workingPalette]);

  const handleSelectHistory = (item: PatternHistoryItemType) => {
    setCurrentPattern(item);
    setWorkingPalette(item.palette || []);
    setPrompt(item.prompt);
    setActiveView('workspace');
  };

  const handleDeleteHistory = async (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    db.deletePattern(id);
    if (currentPattern?.id === id) setCurrentPattern(null);
  };

  if (activeView === 'landing') {
    return <LandingPage onEnter={handleLaunchStudio} onLogin={() => setActiveView('auth')} onSignup={() => setActiveView('auth')} />;
  }

  if (activeView === 'console' && isHeadlessConsole) {
    return <div className="h-screen w-screen flex flex-col bg-black"><LogMonitor /></div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-main text-main font-sans transition-colors duration-300">
      <Header 
        activeView={activeView} 
        onNavigate={setActiveView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
        onHome={() => setActiveView('landing')}
        onPopoutConsole={handleLaunchConsole}
        onShare={handleCopyAppUrl}
      />
      
      <main className="flex-1 flex min-h-0 relative">
        {activeView === 'workspace' && (
          <>
            <aside className={`fixed lg:relative z-40 lg:z-10 h-full transition-all duration-500 ${showLeftPanel ? 'w-[320px] translate-x-0' : 'w-0 -translate-x-full lg:translate-x-0 overflow-hidden opacity-0'}`}>
              <ControlPanel prompt={prompt} setPrompt={setPrompt} onGenerate={handleGenerate} isGenerating={isGenerating} history={history} onSelectHistory={handleSelectHistory} currentPattern={currentPattern} />
            </aside>
            <div className="flex-1 relative bg-main overflow-hidden flex flex-col">
              {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
                  <span className="font-bold text-xs uppercase tracking-widest">Error: {error}</span>
                  <button onClick={() => setError(null)} className="hover:scale-110 transition-transform">✕</button>
                </div>
              )}
              {isGenerating && (
                 <div className="absolute inset-0 z-[60] bg-white/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="w-16 h-16 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mb-6"></div>
                    <div className="text-center space-y-2">
                       <h3 className="text-xl font-serif font-bold text-main animate-pulse">Designing your textile...</h3>
                       <p className="text-xs text-dim uppercase tracking-[0.2em]">Our AI Atelier is stitching your motif</p>
                    </div>
                 </div>
              )}
              <div className="absolute top-6 left-6 z-30 flex gap-2">
                <button onClick={() => setShowLeftPanel(!showLeftPanel)} className={`p-3 bg-panel/80 backdrop-blur-md rounded-2xl border border-theme shadow-xl ${showLeftPanel ? 'text-[var(--primary)]' : 'text-dim'}`}><Wand2 size={20}/></button>
              </div>
              <div className="absolute top-6 right-6 z-30 flex gap-2">
                <button onClick={() => setShowRightPanel(!showRightPanel)} className={`p-3 bg-panel/80 backdrop-blur-md rounded-2xl border border-theme shadow-xl ${showRightPanel ? 'text-[var(--primary)]' : 'text-dim'}`}><SlidersHorizontal size={20}/></button>
              </div>
              <PatternCanvas currentPattern={currentPattern} scale={scale} setScale={setScale} rotation={rotation} setRotation={setRotation} fabricType={fabricType} repeatMode={repeatMode} />
            </div>
            <aside className={`fixed right-0 lg:relative z-40 lg:z-10 h-full transition-all duration-500 ${showRightPanel ? 'w-[320px] translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 overflow-hidden opacity-0'}`}>
              <ToolsPanel currentPattern={currentPattern} palette={workingPalette} setPalette={setWorkingPalette} fabricType={fabricType} setFabricType={setFabricType} repeatMode={repeatMode} setRepeatMode={setRepeatMode} />
            </aside>
          </>
        )}
        {activeView === 'library' && <Library history={history} onSelect={handleSelectHistory} onDelete={handleDeleteHistory} />}
        {activeView === 'gallery' && <Gallery onSelect={handleSelectHistory} />}
        {activeView === 'admin' && currentUser?.role === 'admin' && <AdminDashboard />}
        {activeView === 'console' && <LogMonitor />}
        {activeView === 'auth' && <Auth onLogin={handleLoginSuccess} onClose={() => setActiveView('workspace')} />}
      </main>
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} onDownloadShortcut={handleDownloadShortcut} onCopyUrl={handleCopyAppUrl} />}
      {isAccountOpen && <AccountModal onClose={() => setIsAccountOpen(false)} onLogout={handleLogout} currentUser={currentUser} onUpdateProfile={handleUpdateProfile} />}
    </div>
  );
};

export default App;