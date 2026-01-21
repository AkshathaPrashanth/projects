
import React, { useState, useRef } from 'react';
import { Wand2, Image as ImageIcon, Sparkles, Clock, Database, X, LayoutTemplate, HelpCircle, Cloud, HardDrive, Upload } from 'lucide-react';
import { PROMPT_TEMPLATES } from '../constants';
import { PatternHistoryItem } from '../types';
import DatasetExplorer from './DatasetExplorer';
import { db } from '../services/databaseService';

interface ControlPanelProps {
  prompt: string;
  setPrompt: (val: string) => void;
  onGenerate: (refImage?: string) => void;
  isGenerating: boolean;
  history: PatternHistoryItem[];
  onSelectHistory: (item: PatternHistoryItem) => void;
  currentPattern: PatternHistoryItem | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  prompt, 
  setPrompt, 
  onGenerate, 
  isGenerating,
  history,
  onSelectHistory,
  currentPattern
}) => {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCloud = db.isConfigured;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-2xl text-main transition-all duration-500 w-[320px] border-r border-slate-100/50 shadow-sm">
      
      {/* Input Section */}
      <div className="p-6 flex flex-col gap-6 border-b border-slate-50 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
           <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-[var(--primary)] animate-pulse"></div>
             Creative Input
           </h2>
           <button className="text-slate-300 hover:text-slate-500 transition-colors"><HelpCircle size={12}/></button>
        </div>

        {/* Dataset Reference Slot */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visual Anchor</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-slate-400 hover:text-[var(--primary)] flex items-center gap-1 transition-colors"
                  >
                    <Upload size={10} />
                    Upload
                  </button>
                  <button 
                    onClick={() => setIsExplorerOpen(true)}
                    className="text-[10px] font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                  >
                    Archive
                  </button>
                </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {referenceImage ? (
                <div className="relative aspect-[16/9] rounded-2xl border border-slate-100 bg-white overflow-hidden group transition-all animate-in zoom-in duration-300 shadow-sm">
                    <img src={referenceImage} alt="Reference" className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                        <div className="flex flex-col">
                           <span className="text-[8px] text-white/60 uppercase tracking-widest font-bold">Inspiration Source</span>
                           <span className="text-[10px] text-white font-serif italic line-clamp-1">User Reference</span>
                        </div>
                    </div>
                    <button 
                      onClick={() => setReferenceImage(undefined)}
                      className="absolute top-2 right-2 p-1 bg-black/40 text-white rounded-full hover:bg-rose-500 transition-colors"
                    >
                        <X size={10}/>
                    </button>
                </div>
            ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[16/9] rounded-2xl border border-dashed border-slate-100 bg-white/50 hover:bg-white hover:border-[var(--primary)]/20 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group shadow-sm"
                >
                    <div className="flex items-center gap-2 text-slate-200 group-hover:text-[var(--primary)] transition-all">
                      <Upload size={16} />
                      <Database size={16} />
                    </div>
                    <span className="text-[9px] text-slate-300 group-hover:text-slate-400 font-bold uppercase tracking-widest text-center px-4">
                      Upload File or Browse Archive
                    </span>
                </div>
            )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Design Prompt</label>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe patterns, colors, fabrics..."
              className="w-full h-40 p-5 text-xs text-slate-600 bg-white border border-slate-100/80 rounded-3xl focus:border-[var(--primary)]/30 focus:ring-0 resize-none transition-all placeholder:text-slate-200 outline-none leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            />
            <div className="absolute bottom-4 right-5 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
               <span className="text-[9px] text-slate-300 font-mono">{prompt.length}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onGenerate(referenceImage)}
          disabled={isGenerating || !prompt.trim()}
          className={`relative overflow-hidden w-full py-4 px-6 rounded-3xl flex items-center justify-center gap-3 text-xs font-bold text-white transition-all transform shadow-lg active:scale-95
            ${isGenerating 
              ? 'bg-slate-50 border border-slate-100 cursor-not-allowed text-slate-300' 
              : 'bg-gradient-to-br from-[var(--primary)] via-[var(--accent)] to-[var(--primary-hover)] hover:shadow-orange-500/20 hover:-translate-y-0.5'}`}
        >
          {isGenerating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
          ) : (
            <>
              <Sparkles size={16} />
              <span className="tracking-[0.1em] uppercase">Generate Pattern</span>
            </>
          )}
        </button>
      </div>

      {/* History Strip */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20 p-6 pt-4">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <Clock size={12} />
             Session Log
           </h3>
           <span className={`text-[8px] font-mono px-2 py-0.5 rounded border border-slate-50 bg-white text-slate-300 uppercase shadow-sm`}>
             {history.length} Saved
           </span>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 content-start custom-scrollbar pr-1">
          {history.length === 0 ? (
             <div className="col-span-2 py-10 text-center border border-dashed border-slate-50 rounded-2xl bg-white/50 flex flex-col items-center justify-center">
               <ImageIcon size={20} className="text-slate-100 mb-2"/>
               <p className="text-[9px] text-slate-200 font-bold uppercase tracking-widest">No Designs Yet</p>
             </div>
          ) : (
            history.slice().reverse().map((item) => (
              <div 
                key={item.id} 
                onClick={() => onSelectHistory(item)}
                className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-[1.02] ${currentPattern?.id === item.id ? 'border-[var(--primary)] shadow-md' : 'border-transparent shadow-sm bg-white'}`}
              >
                <img 
                  src={item.imageUrl} 
                  alt="pattern" 
                  className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all" 
                />
              </div>
            ))
          )}
        </div>
      </div>
      
      {isExplorerOpen && <DatasetExplorer onSelect={(url) => { setReferenceImage(url); setIsExplorerOpen(false); }} onClose={() => setIsExplorerOpen(false)} />}
    </div>
  );
};

export default ControlPanel;
