
import React, { useState, useRef, useEffect } from 'react';
import { PatternHistoryItem, FabricType, RepeatMode } from '../types';
import { Shirt, ShoppingBag, Grid3X3, Armchair, ZoomIn, ZoomOut, RotateCw, Monitor, Sparkles, Send, Download, Database, Maximize2, Split, Palette } from 'lucide-react';
import { visualizePatternOnProduct } from '../services/geminiService';
import html2canvas from 'html2canvas';

interface PatternCanvasProps {
  currentPattern: PatternHistoryItem | null;
  scale: number;
  setScale: (val: number) => void;
  rotation: number;
  setRotation: (val: number) => void;
  fabricType: FabricType;
  repeatMode: RepeatMode;
}

type ViewMode = '2D' | '3D';
type MockupType = 'tshirt' | 'dress' | 'pillow' | 'tote' | 'custom' | 'reference' | 'fullview';

const PatternCanvas: React.FC<PatternCanvasProps> = ({ 
  currentPattern, 
  scale, 
  setScale, 
  rotation, 
  setRotation,
  fabricType,
  repeatMode
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('2D');
  const [mockupType, setMockupType] = useState<MockupType>('tshirt');
  const [customPrompt, setCustomPrompt] = useState("");
  const [visualizedImage, setVisualizedImage] = useState<string | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const startPan = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setVisualizedImage(null); 
    
    if (currentPattern?.fullViewMockupUrl) {
      setViewMode('3D');
      setMockupType('fullview');
    } else if (currentPattern?.referenceMockupUrl) {
      setViewMode('3D');
      setMockupType('reference');
    } else if (mockupType === 'reference' || mockupType === 'fullview') {
      setMockupType('tshirt');
    }
  }, [currentPattern]);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (viewMode === '3D') return;
    setIsPanning(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startPan.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPanning) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setPosition({ x: clientX - startPan.current.x, y: clientY - startPan.current.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleVisualize = async () => {
    if (!currentPattern?.imageUrl || !customPrompt.trim()) return;
    setIsVisualizing(true);
    try {
      const resultUrl = await visualizePatternOnProduct(currentPattern.imageUrl, customPrompt);
      setVisualizedImage(resultUrl);
    } catch (e) {
      alert("Failed to visualize.");
    } finally {
      setIsVisualizing(false);
    }
  };

  const handleDownloadMockup = async () => {
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { backgroundColor: null, useCORS: true, scale: 2 });
    const link = document.createElement('a');
    link.download = `fashion-mockup-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getTextureOverlay = () => {
    switch (fabricType) {
      case 'cotton': return 'url(https://www.transparenttextures.com/patterns/cotton-fabric.png)';
      case 'canvas': return 'url(https://www.transparenttextures.com/patterns/canvas-orange.png)';
      case 'silk': return 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)';
      default: return 'none';
    }
  };

  const render2DPattern = () => {
    if (!currentPattern) return null;
    const tileSize = (window.innerWidth < 768 ? 256 : 512) * scale;
    return (
      <div 
        className="absolute inset-0 cursor-move origin-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
          backgroundImage: `url(${currentPattern.imageUrl})`,
          backgroundRepeat: 'repeat',
          backgroundSize: `${tileSize}px`,
          imageRendering: 'auto',
          transition: isPanning ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {fabricType !== 'none' && (
           <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50" 
                style={{ backgroundImage: getTextureOverlay() }}></div>
        )}
      </div>
    );
  };

  const renderMockup = () => {
    if (!currentPattern) return null;

    if (mockupType === 'fullview' && currentPattern.fullViewMockupUrl) {
      return (
        <div ref={captureRef} className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-main transition-all duration-500 overflow-hidden">
           <div className="absolute w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at center, var(--primary) 0%, transparent 70%)` }}></div>
           <div className="relative z-10 w-full max-w-5xl h-full flex flex-col justify-center gap-6 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between px-2">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-dim flex items-center gap-2">
                    <Split size={14} className="text-[var(--primary)]" />
                    Technical 3D Projection: Front & Back
                 </h4>
                 <div className="text-[10px] font-mono text-dim px-2 py-0.5 rounded border border-theme">RENDER_MODE: FULL_GARMENT</div>
              </div>
              <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-theme bg-panel group">
                 <img 
                    src={currentPattern.fullViewMockupUrl} 
                    alt="Garment Full View" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]" 
                 />
                 <div className="absolute bottom-6 left-6 flex gap-3">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur text-white text-[9px] font-bold rounded-full uppercase tracking-wider border border-white/10">Front Silhouette</span>
                    <span className="px-3 py-1 bg-black/60 backdrop-blur text-white text-[9px] font-bold rounded-full uppercase tracking-wider border border-white/10">Rear Elevation</span>
                 </div>
              </div>
           </div>
        </div>
      );
    }

    if (mockupType === 'reference' && currentPattern.referenceMockupUrl) {
        return (
          <div ref={captureRef} className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12 bg-main transition-colors duration-300">
             <div className="absolute w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-[var(--primary)] opacity-5 rounded-full blur-3xl"></div>
             <img src={currentPattern.referenceMockupUrl} alt="Reference Mockup" className="max-w-full max-h-[70vh] md:max-h-[85vh] rounded-2xl shadow-2xl z-10 animate-in fade-in zoom-in duration-500" />
          </div>
        );
    }

    if (mockupType === 'custom') {
      if (isVisualizing) return (
        <div className="flex flex-col items-center justify-center h-full text-muted space-y-4 font-serif">
           <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin"></div>
           <p className="animate-pulse">Hallucinating fashion design...</p>
        </div>
      );
      if (visualizedImage) return <div ref={captureRef} className="relative w-full h-full flex items-center justify-center bg-main p-4 md:p-8"><img src={visualizedImage} className="max-w-full max-h-[70vh] md:max-h-full rounded-2xl shadow-2xl" /></div>;
      return <div className="flex flex-col items-center justify-center h-full text-dim opacity-60 font-serif italic p-8 text-center">Your custom request will appear here. Try "Linen Summer Shirt".</div>;
    }

    const svgPatternSize = 20 * scale; 
    const patternId = "fabric-pattern";

    return (
      <div ref={captureRef} className="relative w-full h-full flex items-center justify-center p-4 md:p-12 bg-main transition-colors duration-300">
        <div className="absolute w-[300px] h-[300px] bg-[var(--primary)] opacity-5 rounded-full blur-3xl"></div>
        <svg viewBox="0 0 400 500" className="w-full h-full max-h-[60vh] md:max-h-[80vh] drop-shadow-2xl z-10">
          <defs>
            <pattern id={patternId} patternUnits="userSpaceOnUse" width={svgPatternSize + "%"} height={svgPatternSize + "%"} patternTransform={`rotate(${rotation})`} >
              <image href={currentPattern.imageUrl} x="0" y="0" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          </defs>

          {mockupType === 'tshirt' && <TShirtPath fill={`url(#${patternId})`} />}
          {mockupType === 'dress' && <DressPath fill={`url(#${patternId})`} />}
          {mockupType === 'pillow' && <PillowPath fill={`url(#${patternId})`} />}
          {mockupType === 'tote' && <TotePath fill={`url(#${patternId})`} />}
        </svg>
      </div>
    );
  };

  if (!currentPattern) {
    return (
      <div className="flex-1 bg-main flex flex-col items-center justify-center relative overflow-hidden text-dim px-6">
         {/* Studio Background Ambience */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[var(--primary)] to-transparent rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-[var(--accent)] to-transparent rounded-full blur-[100px]"></div>
         </div>

         <div className="z-10 bg-panel/40 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] border border-theme text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] max-w-lg animate-in fade-in zoom-in slide-in-from-bottom-8 duration-700">
            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-4 bg-white/50 rounded-2xl border border-theme flex flex-col items-center gap-2">
                  <Palette size={24} className="text-[var(--primary)]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-dim">Palette Extraction</span>
               </div>
               <div className="p-4 bg-white/50 rounded-2xl border border-theme flex flex-col items-center gap-2">
                  <Grid3X3 size={24} className="text-[var(--primary)]" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-dim">Seamless Tiling</span>
               </div>
            </div>
            <h3 className="text-2xl font-serif font-bold text-main mb-4">Digital Atelier Ready</h3>
            <p className="text-sm text-muted leading-relaxed font-light mb-8">Your infinite canvas is awaiting its first synthesis. Use the creative panel to generate unique high-fidelity textile assets.</p>
            <div className="flex justify-center items-center gap-4">
               <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {String.fromCharCode(64+i)}
                    </div>
                  ))}
               </div>
               <span className="text-[10px] font-bold text-dim uppercase tracking-widest">Join 1k+ Designers</span>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 relative overflow-hidden bg-main transition-colors duration-300" 
      ref={containerRef} 
      onMouseDown={handleMouseDown} 
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp} 
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      
      {/* View Mode Toggle */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-4 w-full justify-center px-4">
        <div className="flex gap-1 p-1 bg-panel/90 backdrop-blur-md rounded-2xl border border-theme shadow-2xl">
            <button onClick={() => setViewMode('2D')} className={`px-4 md:px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === '2D' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-muted hover:text-main'}`}>
              <Grid3X3 size={14}/> <span className="hidden sm:inline">2D View</span><span className="sm:hidden">2D</span>
            </button>
            <button onClick={() => setViewMode('3D')} className={`px-4 md:px-6 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === '3D' ? 'bg-[var(--primary)] text-white shadow-lg' : 'text-muted hover:text-main'}`}>
              <Shirt size={14}/> <span className="hidden sm:inline">3D Mockup</span><span className="sm:hidden">3D</span>
            </button>
        </div>
      </div>

      {viewMode === '2D' ? render2DPattern() : renderMockup()}
      
      {viewMode === '3D' && !isVisualizing && (
          <button onClick={handleDownloadMockup} className="absolute top-6 right-6 z-20 p-3 bg-panel hover:bg-[var(--primary)] text-muted hover:text-white rounded-2xl shadow-xl border border-theme transition-all">
            <Download size={20} />
          </button>
      )}

      {/* Mockup Selector */}
      {viewMode === '3D' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 w-full max-w-lg px-6 pointer-events-none">
           {mockupType === 'custom' && (
             <div className="pointer-events-auto w-full flex gap-2 bg-panel/90 backdrop-blur-md p-2 rounded-2xl border border-theme shadow-2xl animate-in slide-in-from-bottom-4">
                <input 
                  type="text" 
                  value={customPrompt} 
                  onChange={(e) => setCustomPrompt(e.target.value)} 
                  placeholder="E.g. Vintage Silk Scarf..." 
                  className="flex-1 bg-element border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-[var(--primary)]/20 outline-none" 
                  onKeyDown={(e) => e.key === 'Enter' && handleVisualize()} 
                />
                <button 
                  onClick={handleVisualize} 
                  disabled={isVisualizing || !customPrompt.trim()} 
                  className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white p-3 rounded-xl shadow-lg transition-all active:scale-95"
                >
                  <Send size={18} />
                </button>
             </div>
           )}
           <div className="pointer-events-auto flex gap-3 p-2 bg-panel/80 backdrop-blur-md rounded-2xl border border-theme shadow-2xl overflow-x-auto no-scrollbar max-w-full">
              {currentPattern.fullViewMockupUrl && (
                <button onClick={() => setMockupType('fullview')} className={`p-4 rounded-xl border transition-all shrink-0 ${mockupType === 'fullview' ? 'bg-[var(--primary)] text-white shadow-inner scale-110 z-10' : 'bg-transparent text-muted hover:bg-element'}`}>
                  <Split size={22} />
                </button>
              )}
              {currentPattern.referenceMockupUrl && (
                <button onClick={() => setMockupType('reference')} className={`p-4 rounded-xl border transition-all shrink-0 ${mockupType === 'reference' ? 'bg-[var(--primary)] text-white shadow-inner' : 'bg-transparent text-muted hover:bg-element'}`}>
                  <Database size={22} />
                </button>
              )}
              {(['tshirt', 'dress', 'tote', 'pillow', 'custom'] as MockupType[]).map(type => (
                  <button key={type} onClick={() => setMockupType(type)} className={`p-4 rounded-xl border transition-all shrink-0 ${mockupType === type ? 'bg-[var(--primary)] text-white shadow-xl scale-110 z-10' : 'bg-transparent text-muted hover:bg-element hover:scale-105'}`}>
                    {type === 'tshirt' && <Shirt size={22} />}
                    {type === 'dress' && <UserDressIcon size={22} />}
                    {type === 'tote' && <ShoppingBag size={22} />}
                    {type === 'pillow' && <Armchair size={22} />}
                    {type === 'custom' && <Sparkles size={22} />}
                  </button>
              ))}
           </div>
        </div>
      )}

      {/* Floating Controls */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col gap-6 bg-panel/90 backdrop-blur-md p-4 rounded-3xl shadow-2xl border border-theme">
         <div className="flex flex-col items-center gap-3">
           <button onClick={() => setScale(Math.min(2, scale + 0.1))} className="p-2 text-muted hover:text-[var(--primary)] transition-colors hover:bg-element rounded-xl"><ZoomIn size={18}/></button>
           <button onClick={() => setScale(Math.max(0.1, scale - 0.1))} className="p-2 text-muted hover:text-[var(--primary)] transition-colors hover:bg-element rounded-xl"><ZoomOut size={18}/></button>
         </div>
         <div className="h-px bg-theme"></div>
         <div className="flex flex-col items-center gap-3 py-2">
            <RotateCw size={14} className="text-dim mb-1"/>
            <input 
              type="range" 
              min="0" 
              max="360" 
              step="5" 
              value={rotation} 
              onChange={(e) => setRotation(parseInt(e.target.value))} 
              className="w-24 h-1 bg-element rounded-full appearance-none cursor-pointer accent-[var(--primary)] origin-center rotate-90 my-10" 
            />
         </div>
      </div>
    </div>
  );
};

const TShirtPath = ({fill}: {fill:string}) => (
  <g transform="translate(50, 20) scale(0.9)">
    <path d="M100,50 Q160,80 220,50 L260,80 L240,140 L220,130 L220,380 L100,380 L100,130 L80,140 L60,80 Z" fill={fill} />
    <path d="M100,50 Q160,80 220,50 L260,80 L240,140 L220,130 L220,380 L100,380 L100,130 L80,140 L60,80 Z" fill="black" fillOpacity="0.1" style={{mixBlendMode: 'multiply'}} />
  </g>
);
const DressPath = ({fill}: {fill:string}) => (
  <g transform="translate(75, 10) scale(0.8)">
    <path d="M110,40 Q160,90 210,40 L230,60 L200,150 Q240,250 280,450 L40,450 Q80,250 120,150 L90,60 Z" fill={fill} />
  </g>
);
const PillowPath = ({fill}: {fill:string}) => (
  <g transform="translate(50, 50)">
    <rect x="20" y="20" width="260" height="260" rx="20" fill={fill} />
    <rect x="20" y="20" width="260" height="260" rx="20" fill="black" fillOpacity="0.05" style={{mixBlendMode: 'multiply'}} />
  </g>
);
const TotePath = ({fill}: {fill:string}) => (
  <g transform="translate(60, 40) scale(0.8)">
    <path d="M110,100 C110,20 210,20 210,100" fill="none" stroke="#94a3b8" strokeWidth="15" />
    <rect x="60" y="100" width="200" height="240" rx="8" fill={fill} />
  </g>
);
const UserDressIcon = ({size = 20}: {size?: number}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8l-2 5h-4l-2-5z" /><path d="M6 7l-2 4 4 10h8l4-10-2-4" /></svg>
);

export default PatternCanvas;
