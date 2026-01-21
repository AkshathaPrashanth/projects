import React from 'react';
import { Sparkles, ArrowRight, Layers, Palette, Grid, Zap } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onLogin, onSignup }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col bg-main text-main overflow-x-hidden transition-colors duration-500 animate-fade-in overflow-y-auto custom-scrollbar">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--primary)] opacity-10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)] opacity-10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Navigation */}
      <nav className="w-full p-6 md:p-8 flex justify-between items-center z-20 animate-fade-in-down shrink-0 sticky top-0 bg-main/50 backdrop-blur-md border-b border-theme/30">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-lg flex items-center justify-center text-white shadow-lg">
             <Layers size={18} />
           </div>
           <span className="font-serif font-bold text-xl tracking-tight text-main">FashionDesignAI</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogin}
            className="px-6 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted hover:text-[var(--primary)] transition-all flex items-center gap-2"
          >
            Log In
          </button>
          <button 
            onClick={onEnter}
            className="px-6 py-2 bg-panel border border-theme rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-main hover:border-[var(--primary)] transition-all shadow-sm flex items-center gap-2"
          >
            <Zap size={14} className="text-[var(--primary)]" />
            Launch Studio
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 text-center w-full max-w-5xl mx-auto px-6 py-12">
        <div className="mb-6 flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="px-4 py-1.5 rounded-full border border-theme bg-panel text-[10px] uppercase tracking-widest font-semibold text-muted shadow-sm flex items-center gap-2">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary)]"></span>
             </span>
             Professional AI Creative Suite
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-medium mb-8 leading-[1.1] tracking-tight animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          Manifest the future <br className="hidden sm:block"/> of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">haute couture.</span>
        </h1>
        
        <p className="text-base md:text-lg text-muted mb-10 md:mb-12 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          The ultimate professional AI workspace for textile and fashion design. Generate seamless repeats, 
          complex textures, and high-fidelity mockups instantly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full animate-fade-in-up mb-20" style={{ animationDelay: '0.8s' }}>
          <button 
            onClick={onEnter}
            className="group relative w-full sm:w-auto px-12 py-6 bg-[var(--primary)] text-white rounded-full font-bold text-sm transition-all hover:bg-[var(--primary-hover)] hover:shadow-2xl hover:shadow-orange-500/40 shadow-xl shadow-orange-500/20 overflow-hidden flex items-center justify-center gap-3 active:scale-95"
          >
             <span className="relative z-10 flex items-center justify-center gap-3 tracking-[0.1em] uppercase text-xs">
               Start Designing <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
             </span>
          </button>
        </div>

        {/* Floating Feature Icons - Simplified integration */}
        <div className="w-full py-12 flex flex-wrap justify-center gap-8 md:gap-24 text-dim animate-fade-in-up shrink-0" style={{ animationDelay: '1s' }}>
           <div className="flex flex-col items-center gap-3 group transition-colors hover:text-main">
              <Sparkles size={24} className="text-[var(--primary)] transition-transform group-hover:scale-110"/>
              <span className="text-[10px] uppercase tracking-widest font-bold">Generative Motifs</span>
           </div>
           <div className="flex flex-col items-center gap-3 group transition-colors hover:text-main">
              <Palette size={24} className="text-[var(--primary)] transition-transform group-hover:scale-110"/>
              <span className="text-[10px] uppercase tracking-widest font-bold">Palette Engineering</span>
           </div>
           <div className="flex flex-col items-center gap-3 group transition-colors hover:text-main">
              <Grid size={24} className="text-[var(--primary)] transition-transform group-hover:scale-110"/>
              <span className="text-[10px] uppercase tracking-widest font-bold">Infinite Repeats</span>
           </div>
        </div>
      </div>

      {/* Footer copyright */}
      <footer className="w-full p-8 text-center text-[9px] text-dim uppercase tracking-widest font-bold border-t border-theme/30 mt-auto">
        &copy; {new Date().getFullYear()} FashionDesignAI &bull; Advanced Generative Synthesis
      </footer>
    </div>
  );
};

export default LandingPage;