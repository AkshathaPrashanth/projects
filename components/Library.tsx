import React from 'react';
import { PatternHistoryItem } from '../types';
import { Trash2, Edit, Grid } from 'lucide-react';

interface LibraryProps {
  history: PatternHistoryItem[];
  onSelect: (item: PatternHistoryItem) => void;
  onDelete: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ history, onSelect, onDelete }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-main p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-serif font-bold text-main mb-2">Pattern Library</h2>
            <p className="text-muted">Manage and revisit your textile generations.</p>
          </div>
          <div className="text-sm text-dim font-medium bg-panel px-4 py-2 rounded-full border border-theme shadow-sm">
            {history.length} Items
          </div>
        </div>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-dim border border-dashed border-theme rounded-2xl bg-panel/30">
            <Grid size={48} className="mb-4 opacity-50"/>
            <h3 className="text-lg font-serif mb-2 text-muted">Library Empty</h3>
            <p>Generate patterns in the Workspace to save them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {history.slice().reverse().map((item) => (
              <div key={item.id} className="group relative bg-panel rounded-xl overflow-hidden border border-theme hover:border-[var(--accent)] transition-all shadow-sm hover:shadow-md">
                <div className="aspect-square relative cursor-pointer" onClick={() => onSelect(item)}>
                  <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <span className="flex items-center gap-2 text-white font-medium bg-[var(--primary)] px-3 py-1.5 rounded-full text-xs shadow-lg transform scale-95 group-hover:scale-100 transition-transform">
                       <Edit size={12}/> Edit
                     </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-main line-clamp-2 mb-2 min-h-[2.5em]">{item.prompt}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-theme">
                    <span className="text-[10px] text-dim">{new Date(item.timestamp).toLocaleDateString()}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                      className="text-dim hover:text-red-400 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 size={14} />
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

export default Library;