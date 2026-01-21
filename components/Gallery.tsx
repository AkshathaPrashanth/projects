import React, { useState } from 'react';
import { Search, Heart, Share2, Download, Filter, Maximize2 } from 'lucide-react';
import { PatternHistoryItem } from '../types';

interface GalleryProps {
  onSelect: (item: PatternHistoryItem) => void;
}

const MOCK_GALLERY: PatternHistoryItem[] = [
  { id: 'g1', prompt: 'Ethereal silk waves in iridescent blue and violet', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop', timestamp: Date.now(), palette: [], author: 'Elara V.', likes: 124 },
  { id: 'g2', prompt: 'Vintage botanical engraving with golden honeycomb', imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop', timestamp: Date.now(), palette: [], author: 'Marcus K.', likes: 89 },
  { id: 'g3', prompt: 'Abstract geometric Bauhaus study in primary colors', imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop', timestamp: Date.now(), palette: [], author: 'Sienna J.', likes: 210 },
  { id: 'g4', prompt: 'Japanese shibori indigo ripples on textured linen', imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop', timestamp: Date.now(), palette: [], author: 'Kenji Y.', likes: 56 },
  { id: 'g5', prompt: 'Neo-noir cyberpunk circuit board print', imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop', timestamp: Date.now(), palette: [], author: 'V-Designer', likes: 15 },
  { id: 'g6', prompt: 'Soft pastel watercolor nebula for luxury scarves', imageUrl: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=800&auto=format&fit=crop', timestamp: Date.now(), palette: [], author: 'Lily Bloom', likes: 302 },
];

const Gallery: React.FC<GalleryProps> = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  
  const filtered = MOCK_GALLERY.filter(item => 
    item.prompt.toLowerCase().includes(search.toLowerCase()) || 
    item.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-theme pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-bold text-main tracking-tight">The Collective</h1>
            <p className="text-muted font-light">Explore the most innovative textile designs from our global community.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-[var(--primary)] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search prompt or designer..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-panel border border-theme rounded-full text-sm outline-none focus:ring-1 focus:ring-[var(--primary)] transition-all w-64 shadow-sm"
              />
            </div>
            <button className="p-2.5 bg-panel border border-theme rounded-full text-muted hover:text-main transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-panel/30 border border-dashed border-theme rounded-2xl">
             <Search size={48} className="mx-auto text-dim mb-4 opacity-20" />
             <p className="text-muted font-serif italic">No patterns found matching your query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <div key={item.id} className="group flex flex-col space-y-4 bg-panel p-4 rounded-2xl border border-theme hover:border-[var(--primary)]/30 hover:shadow-2xl hover:shadow-orange-500/5 transition-all animate-in fade-in zoom-in duration-300">
                <div className="relative aspect-square rounded-xl overflow-hidden cursor-pointer" onClick={() => onSelect(item)}>
                  <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                    <button className="self-end p-2 bg-white/10 backdrop-blur rounded-full text-white mb-auto hover:bg-white/20">
                      <Maximize2 size={16} />
                    </button>
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-rose-400 border border-white/20 flex items-center justify-center text-[10px] font-bold">
                          {item.author?.[0]}
                        </div>
                        <span className="text-xs font-medium">{item.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <Heart size={14} className="fill-rose-500 text-rose-500" />
                        {item.likes}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-1">
                  <p className="text-xs text-muted line-clamp-2 italic font-serif leading-relaxed min-h-[2.5em]">"{item.prompt}"</p>
                  <div className="flex items-center gap-3 pt-4">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-element hover:bg-element-hover rounded-lg text-[10px] font-bold uppercase tracking-widest text-muted transition-colors">
                      <Download size={12} /> Save
                    </button>
                    <button className="p-2 bg-element hover:bg-element-hover rounded-lg text-muted transition-colors">
                      <Share2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;