import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Database, Activity, WifiOff, Cpu, Network } from 'lucide-react';
import { db } from '../services/databaseService';
import { ActivityLog } from '../types';

const LogMonitor: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const [newLogs, newStats] = await Promise.all([
        db.getLogs(),
        db.getStats()
      ]);
      if (newLogs && Array.isArray(newLogs)) {
        setLogs([...newLogs].reverse());
      }
      if (newStats) setStats(newStats);
    } catch (e) {
      console.error("Log fetch failed", e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      if (isLive) fetchLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const isFallback = stats?.dbStatus === 'Local Cache';

  return (
    <div className="flex-1 bg-[#09090b] text-[#71717a] font-mono text-[11px] flex flex-col overflow-hidden animate-fade-in">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#121215] border-b border-white/5">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <Terminal size={16} className="text-[#a1a1aa]" />
             <span className="text-[#e4e4e7] font-bold tracking-tight uppercase text-[10px]">System Kernel Monitor v3.1</span>
           </div>
           <div className="h-4 w-px bg-white/10"></div>
           <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div>
              <span className="text-[9px] font-bold uppercase tracking-widest">{isLive ? 'Live Stream Active' : 'Buffer Paused'}</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isFallback && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 text-[9px] font-bold animate-pulse">
               <WifiOff size={12} />
               OFFLINE MODE
            </div>
          )}
          <button 
            onClick={() => setIsLive(!isLive)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-[9px] font-bold uppercase transition-all"
          >
            {isLive ? 'Pause Buffer' : 'Resume Stream'}
          </button>
        </div>
      </div>

      {/* Hardware Status Strip */}
      <div className="grid grid-cols-4 gap-px bg-white/5 border-b border-white/5">
         {[
           { label: 'DB NODE', val: stats?.dbStatus || 'OFFLINE', icon: Database, color: isFallback ? 'text-amber-400' : 'text-emerald-400' },
           { label: 'DRIVER', val: isFallback ? 'BROWSER_LOCAL' : 'MONGO_V4_NATIVE', icon: Cpu, color: 'text-zinc-400' },
           { label: 'TRAFFIC', val: `${logs?.length || 0} EV`, icon: Network, color: 'text-blue-400' },
           { label: 'LATENCY', val: isFallback ? '0ms' : '0.42ms', icon: Activity, color: 'text-rose-400' }
         ].map((stat, i) => (
           <div key={i} className="bg-[#09090b] p-3 flex items-center gap-3">
              <stat.icon size={14} className={stat.color} />
              <div>
                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">{stat.label}</p>
                <p className={`text-[10px] font-bold ${stat.color}`}>{stat.val}</p>
              </div>
           </div>
         ))}
      </div>

      {/* Main Console Buffer */}
      <div 
        ref={scrollRef}
        className="flex-1 p-6 overflow-y-auto selection:bg-emerald-500/20 custom-scrollbar"
      >
        <div className="space-y-1">
          <div className="text-zinc-600 border-b border-white/5 pb-4 mb-4">
            [BOOT] Environment: Production<br/>
            [BOOT] Node Engine: v20.x.x<br/>
            [BOOT] Ready for operations.<br/>
            {isFallback && <span className="text-amber-500/80">[WARN] Docker Backend Unreachable. Switching to Browser-Local Storage...</span>}
          </div>

          {!logs || logs.length === 0 ? (
            <div className="py-4 text-zinc-500 italic">No activity detected in buffer.</div>
          ) : (
            logs.map((log) => (
              <div key={log?.id || Math.random()} className="group hover:bg-white/5 px-2 py-0.5 rounded transition-colors flex gap-4 animate-in fade-in duration-300">
                 <span className="text-zinc-600 shrink-0">[{new Date(log?.timestamp || Date.now()).toLocaleTimeString()}]</span>
                 <div className="flex-1">
                   <span className={`font-bold mr-2 ${
                     log?.type === 'error' ? 'text-rose-500' : 
                     log?.type === 'success' ? 'text-emerald-400' : 
                     log?.type === 'warning' ? 'text-amber-400' : 
                     'text-blue-400'
                   }`}>
                     {(log?.userName || 'System').toUpperCase()}
                   </span>
                   <span className="text-zinc-200">{log?.action || 'Undefined Operation'}</span>
                   <p className="text-zinc-500 pl-4 mt-0.5 text-[10px] italic border-l border-white/10 ml-2">
                     {log?.detail || 'No telemetry detail provided.'}
                   </p>
                 </div>
              </div>
            ))
          )}
          <div className="animate-pulse text-emerald-500 mt-2">█</div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-[#121215] border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4 text-[9px] font-bold text-zinc-500">
            <span>UPTIME: {Math.floor(performance.now() / 1000)}s</span>
            <span>STORAGE: {isFallback ? 'LocalStorage' : 'MongoDB Cluster'}</span>
         </div>
         <div className="text-[9px] text-zinc-600 font-bold">
            {isFallback ? 'DIRECT_TO_BROWSER' : 'STDOUT_PIPELINE'} : CONNECTED
         </div>
      </div>
    </div>
  );
};

export default LogMonitor;