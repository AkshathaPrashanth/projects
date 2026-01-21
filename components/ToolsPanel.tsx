import React, { useState, useRef } from 'react';
import { Download, Palette, Layers, Grid, Share2, FileText, Check, SlidersHorizontal, Info, Lock, Unlock, Plus, Trash2 } from 'lucide-react';
import { PatternHistoryItem, FabricType, RepeatMode, Color } from '../types';
import jsPDF from 'jspdf';
import { rgbToHex } from '../utils/colorUtils';

interface ToolsPanelProps {
  currentPattern: PatternHistoryItem | null;
  palette: Color[];
  setPalette: (p: Color[]) => void;
  fabricType: FabricType;
  setFabricType: (val: FabricType) => void;
  repeatMode: RepeatMode;
  setRepeatMode: (val: RepeatMode) => void;
}

const ToolsPanel: React.FC<ToolsPanelProps> = ({ 
  currentPattern, 
  palette,
  setPalette,
  fabricType, 
  setFabricType,
  repeatMode,
  setRepeatMode
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  const handleDownload = () => {
    if (!currentPattern) return;
    const link = document.createElement('a');
    link.href = currentPattern.imageUrl;
    link.download = `fashion-design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if(!currentPattern) return;
    try {
      await navigator.clipboard.writeText(`Check out this AI textile pattern: ${currentPattern.prompt}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch(err) {
      console.error("Failed to copy", err);
    }
  };

  const toggleLock = (index: number) => {
    const newPalette = [...palette];
    newPalette[index].locked = !newPalette[index].locked;
    setPalette(newPalette);
  };

  const removeColor = (index: number) => {
    const newPalette = palette.filter((_, i) => i !== index);
    setPalette(newPalette);
  };

  const addColor = (hex: string) => {
    if (palette.length >= 8) return;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    setPalette([...palette, { hex: hex.toUpperCase(), rgb: [r, g, b], locked: true }]);
  };

  const handlePreviewPDF = () => {
    if (!currentPattern) return;
    setIsExporting(true);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.text("FashionDesignAI Specification", 20, 20);
    doc.addImage(currentPattern.imageUrl, "JPEG", (pageWidth - 120) / 2, 40, 120, 120);
    doc.save("fashion-spec-sheet.pdf");
    setIsExporting(false);
  };

  const fabrics: {id: FabricType, label: string}[] = [
    {id: 'none', label: 'Flat Digital'},
    {id: 'cotton', label: 'Cotton'},
    {id: 'silk', label: 'Silk'},
    {id: 'canvas', label: 'Canvas'},
  ];

  const repeats: {id: RepeatMode, label: string}[] = [
    {id: 'grid', label: 'Grid'},
    {id: 'brick', label: 'Brick'},
    {id: 'half-drop', label: 'Drop'},
  ];

  return (
    <div className="flex flex-col h-full bg-panel/80 backdrop-blur-xl text-main transition-all duration-500 w-[320px] shadow-vibrant border-l border-theme">
      
      <div className="p-6 border-b border-theme bg-main/5 flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-dim uppercase tracking-[0.2em] flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-[var(--primary)]" />
            Configurator
          </h2>
          <button className="text-dim hover:text-main"><Info size={14}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 no-scrollbar">
        
        {/* Color Palette Management */}
        <section className="space-y-4">
           <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-dim uppercase tracking-widest flex items-center gap-2">
                <Palette size={12} className="text-[var(--primary)]" />
                Dye Palette
            </label>
            <div className="flex items-center gap-2">
              <input type="color" ref={colorInputRef} className="hidden" onChange={(e) => addColor(e.target.value)} />
              <button 
                onClick={() => colorInputRef.current?.click()}
                className="p-1.5 bg-element hover:bg-element-hover rounded-lg text-[var(--primary)] transition-all border border-theme hover:scale-110"
              >
                <Plus size={12}/>
              </button>
            </div>
           </div>
           
           <div className="grid grid-cols-4 gap-2">
               {palette.map((color: Color, idx: number) => (
                 <div key={`${color.hex}-${idx}`} className="group relative aspect-square rounded-xl cursor-pointer ring-2 ring-transparent hover:ring-[var(--primary)]/30 transition-all overflow-hidden border border-theme shadow-sm" 
                      style={{ backgroundColor: color.hex }}>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                       <button onClick={(e) => { e.stopPropagation(); toggleLock(idx); }} className="p-1 hover:text-[var(--primary)] text-white">
                         {color.locked ? <Lock size={12} /> : <Unlock size={12} />}
                       </button>
                       <button onClick={(e) => { e.stopPropagation(); removeColor(idx); }} className="p-1 hover:text-rose-500 text-white">
                         <Trash2 size={12} />
                       </button>
                    </div>
                    {color.locked && <div className="absolute top-1 right-1 text-white drop-shadow-md"><Lock size={8} /></div>}
                 </div>
               ))}
           </div>
           
           <div className="space-y-1">
              {palette.map((color: Color, idx: number) => (
                 <div key={`${color.hex}-list-${idx}`} className="flex items-center justify-between text-[10px] text-muted bg-element/30 hover:bg-element/60 px-3 py-2.5 rounded-xl border border-theme transition-all group">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: color.hex }}></div>
                       <span className="font-mono text-[9px] text-main group-hover:text-[var(--primary)] transition-colors">{color.hex}</span>
                    </div>
                    <button onClick={() => toggleLock(idx)} className={`p-1 transition-colors ${color.locked ? 'text-[var(--primary)]' : 'text-dim hover:text-main'}`}>
                      {color.locked ? <Lock size={10} /> : <Unlock size={10} />}
                    </button>
                 </div>
              ))}
           </div>
        </section>

        {/* Material Finish */}
        <section className="space-y-4">
           <label className="text-[10px] font-bold text-dim uppercase tracking-widest flex items-center gap-2">
              <Layers size={12} className="text-[var(--primary)]" />
              Texture Mask
           </label>
           <div className="grid grid-cols-2 gap-2">
             {fabrics.map(f => (
               <button
                 key={f.id}
                 onClick={() => setFabricType(f.id)}
                 className={`py-3 px-2 rounded-xl text-[9px] font-bold uppercase tracking-widest text-center transition-all border ${fabricType === f.id ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] border-transparent text-white shadow-lg' : 'bg-element/50 border-theme text-muted hover:bg-element'}`}
               >
                 {f.label}
               </button>
             ))}
           </div>
        </section>
      </div>

      <div className="p-6 border-t border-theme bg-main/5 space-y-3">
          <button 
            onClick={handleDownload}
            disabled={!currentPattern}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={14} />
            Export Assets
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={handleShare}
                disabled={!currentPattern}
                className="py-3 rounded-2xl border border-theme bg-panel hover:bg-element text-muted text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
                {copied ? <Check size={12} className="text-green-500"/> : <Share2 size={12} />}
                {copied ? 'Copied' : 'Share'}
            </button>
             <button 
                onClick={handlePreviewPDF}
                disabled={!currentPattern || isExporting}
                className="py-3 rounded-2xl border border-theme bg-panel hover:bg-element text-muted text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
                {isExporting ? <div className="w-3 h-3 border-2 border-current rounded-full animate-spin"></div> : <FileText size={12} />}
                PDF Spec
            </button>
          </div>
      </div>
    </div>
  );
};

export default ToolsPanel;