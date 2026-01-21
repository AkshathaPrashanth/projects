import React from 'react';
import { X, Search, Info } from 'lucide-react';

interface DatasetExplorerProps {
  onSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { id: 0, name: 'T-shirt/top', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop' },
  { id: 1, name: 'Trouser', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=200&h=200&fit=crop' },
  { id: 2, name: 'Pullover', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a4bb4?w=200&h=200&fit=crop' },
  { id: 3, name: 'Dress', url: 'https://images.unsplash.com/photo-1539008835270-381442a22676?w=200&h=200&fit=crop' },
  { id: 4, name: 'Coat', url: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=200&h=200&fit=crop' },
  { id: 5, name: 'Sandal', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop' },
  { id: 6, name: 'Shirt', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop' },
  { id: 7, name: 'Sneaker', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop' },
  { id: 8, name: 'Bag', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=200&h=200&fit=crop' },
  { id: 9, name: 'Ankle boot', url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=200&h=200&fit=crop' },
];

const DatasetExplorer: React.FC<DatasetExplorerProps> = ({ onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-panel w-full max-w-2xl rounded-2xl border border-theme shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-theme flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-main">Fashion-MNIST Archive</h3>
            <p className="text-xs text-muted">Select an item to use its shape and motif as design inspiration.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-main transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 bg-element border-b border-theme flex items-center gap-2">
            <Search size={16} className="text-dim"/>
            <input 
              type="text" 
              placeholder="Filter by label (Sneaker, Bag...)" 
              className="bg-transparent border-none text-sm text-main w-full focus:ring-0 placeholder:text-dim"
            />
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {CATEGORIES.map((item) => (
            <div 
              key={item.id} 
              onClick={() => {
                onSelect(item.url);
                onClose();
              }}
              className="group cursor-pointer space-y-2"
            >
              <div className="aspect-square bg-main rounded-xl border border-theme overflow-hidden group-hover:border-[var(--primary)] transition-all relative">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                <div className="absolute top-1 right-1 bg-black/50 text-[8px] text-white px-1.5 py-0.5 rounded font-mono">ID: {item.id}</div>
              </div>
              <p className="text-[10px] text-center font-bold uppercase tracking-widest text-muted group-hover:text-main">{item.name}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-element border-t border-theme flex items-center gap-3 text-[10px] text-dim font-medium italic">
           <Info size={14} className="text-[var(--accent)] shrink-0"/>
           The AI will extract motifs, silhouettes, and texture characteristics from the selected fashion category to inform the pattern generation logic.
        </div>
      </div>
    </div>
  );
};

export default DatasetExplorer;