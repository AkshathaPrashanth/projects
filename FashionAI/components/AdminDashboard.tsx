
import React, { useEffect, useState, useRef } from 'react';
import { Users, Image as ImageIcon, Activity, ShieldCheck, Database, Globe, Server, Zap, Terminal, ExternalLink, Fingerprint, Search, X } from 'lucide-react';
import { db } from '../services/databaseService';
import { User, ActivityLog } from '../types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalDesigns: 0,
    totalUsers: 0,
    last24hCount: 0,
    adminCount: 0,
    dbStatus: 'Connecting...',
    driver: 'Standard Node Driver'
  });
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    try {
      const [newStats, newLogs, newUsers] = await Promise.all([
        db.getStats(),
        db.getLogs(),
        db.getUsers()
      ]);
      setStats(newStats);
      setLogs([...newLogs].reverse());
      setUsers(newUsers);
    } catch (e) {
      console.error("Dashboard refresh failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, selectedUser]);

  const handlePopout = () => {
    window.open(`${window.location.origin}${window.location.pathname}?view=console`, '_blank');
  };

  const filteredLogs = selectedUser 
    ? logs.filter(log => log.userName === selectedUser.name || log.userId === selectedUser.id)
    : logs;

  const statCards = [
    { label: 'Active Sessions', value: stats.totalUsers, trend: 'Network', color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Users },
    { label: 'Cloud Assets', value: stats.totalDesigns, trend: 'Synchronized', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: ImageIcon },
    { label: 'Driver Latency', value: ' < 2ms', trend: 'Optimal', color: 'text-green-500', bg: 'bg-green-500/10', icon: Activity },
    { label: 'Infrastructure', value: 'DOCKER_NODE', trend: 'Active', color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Server },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-main transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 p-8 bg-panel rounded-[2.5rem] border border-theme shadow-xl relative overflow-hidden">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                <ShieldCheck size={24} />
              </div>
              <h1 className="text-3xl font-serif font-bold text-main">Cluster Governance</h1>
            </div>
            <p className="text-muted text-sm max-w-lg">Advanced monitoring of user sessions, design activity, and kernel-level telemetry.</p>
          </div>
          
          <div className="flex items-center gap-6 bg-element/50 p-4 rounded-3xl border border-theme">
             <div className="flex flex-col items-center px-4 border-r border-theme">
                <span className="text-[10px] font-bold text-dim uppercase tracking-widest mb-1">Database Node</span>
                <span className="flex items-center gap-2 text-xs font-bold text-green-500">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   DOCKER_MDB:27018
                </span>
             </div>
             <div className="flex flex-col items-center px-4">
                <span className="text-[10px] font-bold text-dim uppercase tracking-widest mb-1">Identity Provider</span>
                <span className="text-xs font-black text-main flex items-center gap-2">
                   <Zap size={14} className="text-orange-500" />
                   AUTH_V3: ACTIVE
                </span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((stat, i) => (
            <div key={i} className="bg-panel p-6 rounded-3xl border border-theme shadow-sm group hover:border-[var(--primary)]/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <stat.icon size={20} />
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${stat.color} bg-current/10`}>
                   {stat.trend}
                </div>
              </div>
              <p className="text-muted text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-main mt-1">{isLoading ? '...' : stat.value}</h3>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-panel rounded-3xl border border-theme shadow-sm overflow-hidden flex flex-col h-full">
               <div className="p-6 border-b border-theme flex items-center justify-between bg-element/20">
                  <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-main">
                    <Globe size={16} className="text-indigo-500" />
                    Designer Registry
                  </h3>
                  {selectedUser && (
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 transition-all"
                    >
                      <X size={14} /> Clear Selection
                    </button>
                  )}
               </div>
               <div className="overflow-x-auto flex-1">
                 <table className="w-full text-left text-sm border-collapse">
                   <thead>
                     <tr className="border-b border-theme bg-element/10">
                       <th className="p-5 font-bold text-dim uppercase text-[10px] tracking-widest">Identity</th>
                       <th className="p-5 font-bold text-dim uppercase text-[10px] tracking-widest">Type</th>
                       <th className="p-5 font-bold text-dim uppercase text-[10px] tracking-widest">Last Activity</th>
                     </tr>
                   </thead>
                   <tbody>
                     {users.map((u) => {
                       const isGuest = u?.id?.startsWith('guest-') ?? true;
                       const isActive = selectedUser?.id === u.id;
                       return (
                        <tr 
                          key={u.id} 
                          onClick={() => setSelectedUser(u)}
                          className={`border-b border-theme transition-colors cursor-pointer ${isActive ? 'bg-indigo-50/50' : 'hover:bg-element/20'}`}
                        >
                          <td className="p-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm ${isGuest ? 'bg-zinc-200 text-zinc-500' : 'bg-gradient-to-tr from-indigo-500 to-purple-500'}`}>
                                {isGuest ? <Fingerprint size={18} /> : (u?.name?.[0] || '?')}
                              </div>
                              <div>
                                <div className="font-bold text-sm text-main">{u.name || 'Anonymous'}</div>
                                <div className="text-[10px] text-dim">{u.email || 'GUEST_CLIENT_ID'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border ${
                              u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' : 
                              isGuest ? 'bg-zinc-100 text-zinc-400 border-zinc-200' : 
                              'bg-orange-500/10 text-orange-600 border-orange-500/20'
                            }`}>
                              {isGuest ? 'Guest' : u.role}
                            </span>
                          </td>
                          <td className="p-5">
                             <div className="flex flex-col">
                                <span className="text-[10px] text-muted font-mono">{u.lastLogin ? new Date(u.lastLogin).toLocaleTimeString() : 'SESSION_IDLE'}</span>
                                <span className={`text-[8px] font-bold uppercase tracking-tighter ${isActive ? 'text-indigo-500' : 'text-dim'}`}>
                                  {isActive ? 'Currently Viewing Logs' : (isGuest ? 'Ephemeral Buffer' : 'Cloud Synchronized')}
                                </span>
                             </div>
                          </td>
                        </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-[#0c0c0c] text-green-500 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col h-[600px] group/console">
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-zinc-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {selectedUser ? `Tracing: ${selectedUser.name}` : 'Global Kernel Monitor'}
                      </span>
                   </div>
                   <button 
                    onClick={handlePopout}
                    className="p-1 hover:bg-zinc-800 rounded text-zinc-500 transition-colors"
                   >
                     <ExternalLink size={12} />
                   </button>
                </div>
                
                <div ref={scrollRef} className="flex-1 p-5 font-mono text-[11px] space-y-2 overflow-y-auto custom-scrollbar bg-black/40">
                   {filteredLogs.length === 0 ? (
                     <div className="text-zinc-700 italic py-4">No specific activity found in buffer for this scope.</div>
                   ) : (
                     filteredLogs.map((log) => (
                       <div key={log.id} className="leading-relaxed animate-in fade-in slide-in-from-left-2 duration-300">
                          <span className="text-zinc-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                          <span className={log.type === 'error' ? 'text-rose-500' : (log?.userId?.startsWith('guest-') ? 'text-zinc-500' : 'text-blue-400')}>
                            {(log?.userName || 'System').toUpperCase()}
                          </span>{' '}
                          <span className="text-zinc-300 font-bold">{log.action || 'OP'}</span>
                          <div className="pl-4 text-zinc-500 text-[10px] flex items-center gap-2 mt-0.5 border-l border-zinc-800 ml-1">
                             {log.detail || 'Telemetry sequence started...'}
                          </div>
                       </div>
                     ))
                   )}
                   <div className="pt-2 animate-pulse text-green-500">_</div>
                </div>
                
                {selectedUser && (
                   <div className="p-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase">
                      <span>Records: {filteredLogs.length}</span>
                      <button onClick={() => setSelectedUser(null)} className="text-zinc-400 hover:text-white transition-colors">Exit Trace</button>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
