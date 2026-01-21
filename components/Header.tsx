import React from 'react';
import { Layers, Sun, Moon, Grid, Shield, Globe, Terminal, ExternalLink, LogIn, Settings, Share2, BookOpen } from 'lucide-react';
import { ViewMode, User as UserType } from '../types';

interface HeaderProps {
  activeView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenSettings: () => void;
  onOpenAccount: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  currentUser: UserType | null;
  onLogout: () => void;
  onHome: () => void;
  onPopoutConsole?: () => void;
  onShare?: () => void;
}

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ElementType;
  canPopout?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  activeView, 
  onNavigate, 
  onOpenSettings,
  onOpenAccount,
  theme, 
  toggleTheme,
  currentUser,
  onLogout,
  onHome,
  onPopoutConsole,
  onShare
}) => {
  const isGuest = currentUser?.id?.startsWith('guest-') ?? true;
  const isAdmin = currentUser?.role === 'admin';

  // Strict check: only show specific items based on role
  const navItems: NavItem[] = [
    { id: 'workspace', label: 'Studio', icon: Layers },
    // Only show Library and Gallery to non-admins (Designers)
    ...(!isAdmin ? [
        { id: 'library', label: 'Library', icon: Grid },
        { id: 'gallery', label: 'Gallery', icon: Globe },
    ] as NavItem[] : []),
    // Only show Console and Admin Dashboard to Admins
    ...(isAdmin ? [
      { id: 'console', label: 'Console', icon: Terminal, canPopout: true },
      { id: 'admin', label: 'Admin', icon: Shield }
    ] as NavItem[] : []),
  ];

  return (
    <header className="h-16 bg-panel/80 backdrop-blur-xl border-b border-theme flex items-center justify-between px-4 md:px-8 shrink-0 z-40 sticky top-0">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={onHome}>
        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] p-2 rounded-xl text-white shadow-lg transition-transform group-hover:scale-105">
          <Layers size={20} />
        </div>
        <h1 className="text-xl font-serif font-bold text-main tracking-tight leading-none">
          FashionDesign<span className="text-[var(--primary)]">AI</span>
        </h1>
      </div>
      
      <div className="hidden lg:flex items-center gap-6">
        <nav className="flex bg-element/50 rounded-2xl p-1 border border-theme shadow-inner">
          {navItems.map((item) => (
            <div key={item.id} className="relative group/nav">
              <button 
                onClick={() => onNavigate(item.id)}
                className={`px-5 py-2 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${
                  activeView === item.id 
                    ? 'bg-white text-[var(--primary)] shadow-lg' 
                    : 'text-muted hover:text-[var(--primary)]'
                }`}
              >
                <item.icon size={14} /> 
                {item.label}
              </button>
              
              {item.canPopout && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onPopoutConsole?.(); }}
                  className="absolute -top-1 -right-1 bg-white border border-theme p-1 rounded-full text-dim hover:text-[var(--primary)] shadow-sm opacity-0 group-hover/nav:opacity-100 transition-opacity"
                  title="Pop-out Monitor"
                >
                  <ExternalLink size={10} />
                </button>
              )}
            </div>
          ))}
        </nav>
        
        <div className="h-6 w-px bg-theme mx-2"></div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onShare}
            className="text-muted hover:text-[var(--primary)] transition-all p-2 rounded-xl hover:bg-element"
            title="Share Studio URL"
          >
            <Share2 size={18} />
          </button>

          <button 
            onClick={onOpenSettings}
            className="text-muted hover:text-[var(--primary)] transition-all p-2 rounded-xl hover:bg-element"
            title="Preferences"
          >
            <Settings size={18} />
          </button>

          <button 
            onClick={toggleTheme}
            className="text-muted hover:text-[var(--primary)] transition-all p-2 rounded-xl hover:bg-element"
          >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {currentUser && !isGuest ? (
            <div className="flex items-center gap-3 border-l border-theme pl-3">
               <div className="flex flex-col items-end">
                 <div className="flex items-center gap-1.5">
                    {isAdmin && <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-500/20">ADMIN</span>}
                    <span className="text-[11px] font-bold text-main">{currentUser.name}</span>
                 </div>
               </div>
               <button 
                onClick={onOpenAccount}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white font-serif font-bold text-sm shadow-lg border-2 border-white/20 hover:scale-105 transition-transform"
               >
                 {currentUser?.name?.[0] || '?'}
               </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('auth')}
              className="px-6 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <LogIn size={14} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;