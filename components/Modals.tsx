
import React, { useState } from 'react';
import { X, Settings, LogOut, Cloud, UserCheck, ShieldCheck, Apple, Copy, HardDrive, Edit3, Save, Mail, Key, User } from 'lucide-react';
import { User as UserType } from '../types';

interface ModalProps {
  onClose: () => void;
  onLogout?: () => void;
  currentUser?: UserType | null;
  onDownloadShortcut?: (os: 'win' | 'mac') => void;
  onCopyUrl?: () => void;
  onUpdateProfile?: (updates: Partial<UserType>) => Promise<void>;
}

export const SettingsModal: React.FC<ModalProps> = ({ onClose, onDownloadShortcut, onCopyUrl }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-7 border-b border-slate-50 shrink-0">
          <h3 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-3">
            <Settings size={20} className="text-[var(--primary)]" /> 
            Preferences & Sharing
          </h3>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors bg-slate-50 p-2 rounded-full">
            <X size={18} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
           <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest ml-1">Desktop Shortcuts</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => onDownloadShortcut?.('win')}
                      className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[var(--primary)] transition-all flex flex-col items-center gap-2 group"
                    >
                      <HardDrive size={24} className="text-slate-300 group-hover:text-[var(--primary)] transition-colors" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">For Windows</span>
                      <span className="text-[8px] text-slate-400">Download .URL file</span>
                    </button>
                    <button 
                      onClick={() => onDownloadShortcut?.('mac')}
                      className="p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[var(--primary)] transition-all flex flex-col items-center gap-2 group"
                    >
                      <Apple size={24} className="text-slate-300 group-hover:text-[var(--primary)] transition-colors" />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">For Mac</span>
                      <span className="text-[8px] text-slate-400">Download .webloc file</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-widest ml-1">Direct Share</p>
                  <div className="p-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-5">
                    <button onClick={onCopyUrl} className="w-full py-4 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        <Copy size={12}/> Copy Studio Link
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                 <label className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] block ml-1">Connectivity Status</label>
                 <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                     <div className="p-3 rounded-2xl bg-white text-emerald-500 shadow-sm transition-transform group-hover:scale-110"><Cloud size={18} /></div>
                     <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">Cloud Sync</span>
                        <span className="text-[10px] text-slate-400 font-mono">NODE_MDB: ACTIVE</span>
                     </div>
                   </div>
                   <div className="text-[9px] font-black px-3 py-1 rounded-full uppercase border bg-emerald-50 text-emerald-600 border-emerald-100">Live</div>
                 </div>
               </div>
             </div>
        </div>

        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-end shrink-0">
            <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm">Dismiss</button>
        </div>
      </div>
    </div>
  );
};

export const AccountModal: React.FC<ModalProps> = ({ onClose, onLogout, currentUser, onUpdateProfile }) => {
    // Fixed: Safe check for currentUser and id before calling startsWith
    const isGuest = currentUser?.id?.startsWith('guest-') ?? true;
    const isAdmin = currentUser?.role === 'admin';

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
      if (!name.trim()) return;
      setIsSaving(true);
      
      const emailChanged = email !== currentUser?.email;
      
      if (emailChanged && !showVerification) {
        // Concept: Send code to new email
        setShowVerification(true);
        setIsSaving(false);
        return;
      }

      if (showVerification && verificationCode !== '1234') { // Mock verification
        alert("Invalid verification code. Please enter '1234' for demo.");
        setIsSaving(false);
        return;
      }

      try {
        await onUpdateProfile?.({ name, email });
        setIsEditing(false);
        setShowVerification(false);
      } catch (e) {
        alert("Failed to update profile.");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-7 border-b border-slate-50">
            <h3 className="text-xl font-serif font-bold text-slate-800">Identity Profile</h3>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors bg-slate-50 p-2 rounded-full"><X size={18} /></button>
          </div>
          
          <div className="p-8">
             <div className="flex flex-col items-center text-center mb-8">
                <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white font-serif font-bold text-4xl shadow-2xl relative mb-6 transition-transform hover:rotate-3 ${isGuest ? 'bg-slate-100 text-slate-300 border border-slate-200' : 'bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)]'}`}>
                    {currentUser?.name?.[0] || 'G'}
                    {!isGuest && (
                      <div className={`absolute -bottom-1 -right-1 p-2 rounded-full border-4 border-white shadow-lg ${isAdmin ? 'bg-indigo-600' : 'bg-emerald-500'}`}>
                         {isAdmin ? <ShieldCheck size={16} className="text-white"/> : <UserCheck size={16} className="text-white" />}
                      </div>
                    )}
                </div>

                {isEditing ? (
                  <div className="w-full space-y-4 text-left animate-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Edit Username</label>
                      <div className="relative">
                        {/* Fixed: User component now correctly references the imported icon from lucide-react */}
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Update Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white transition-all outline-none"
                        />
                      </div>
                    </div>

                    {showVerification && (
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl animate-in zoom-in space-y-3">
                         <p className="text-[10px] text-orange-700 font-bold flex items-center gap-2">
                           <Key size={12} /> Email change requires verification.
                         </p>
                         <input 
                           type="text" 
                           placeholder="Enter 4-digit code (Use 1234)" 
                           maxLength={4}
                           value={verificationCode}
                           onChange={(e) => setVerificationCode(e.target.value)}
                           className="w-full px-4 py-2 bg-white border border-orange-200 rounded-lg text-xs font-mono tracking-[1em] text-center outline-none"
                         />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 py-3 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2"
                      >
                        {isSaving ? 'Saving...' : <><Save size={14}/> Save Changes</>}
                      </button>
                      <button 
                        onClick={() => { setIsEditing(false); setShowVerification(false); }}
                        className="px-6 py-3 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                       <h4 className="text-2xl font-bold text-slate-800 leading-none">{currentUser?.name || 'Guest Designer'}</h4>
                       {!isGuest && (
                         <button onClick={() => setIsEditing(true)} className="p-1.5 text-slate-300 hover:text-[var(--primary)] hover:bg-slate-50 rounded-lg transition-all">
                           <Edit3 size={14} />
                         </button>
                       )}
                    </div>
                    <p className="text-xs text-slate-400 font-light">{currentUser?.email || 'guest-access@fashion.ai'}</p>
                    <div className="mt-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 text-[9px] font-black uppercase rounded-full border tracking-widest ${
                        isAdmin ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                        isGuest ? 'bg-slate-50 text-slate-400 border-slate-100' : 
                        'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {isAdmin ? 'System Root' : isGuest ? 'Anonymous Access' : 'Pro Membership'}
                      </div>
                    </div>
                  </div>
                )}
             </div>
  
             {!isEditing && (
               <div className="space-y-4">
                  {isAdmin ? (
                    <div className="p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100 space-y-3">
                       <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-widest">Kernel Privileges</p>
                       <p className="text-[10px] text-indigo-600/70 leading-relaxed">Full read/write permissions on the MongoDB cluster. Remote telemetry enabled.</p>
                    </div>
                  ) : !isGuest && (
                    <div className="p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-100 space-y-3">
                       <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-widest">Creative Benefits</p>
                       <p className="text-[10px] text-emerald-600/70 leading-relaxed">Cloud synchronization is active. All historical assets are persisted to your designer archive.</p>
                    </div>
                  )}

                  {isGuest && (
                    <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 text-center space-y-2">
                       <p className="text-[10px] text-slate-400 leading-relaxed">Guest designs are stored locally. Sign up to enable cloud sync and unique identification.</p>
                    </div>
                  )}
               </div>
             )}
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t border-slate-50">
              <button 
                onClick={() => { onLogout?.(); onClose(); }}
                className="w-full py-5 bg-white hover:bg-rose-500 hover:text-white border border-slate-100 text-slate-400 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-sm group"
              >
                  <LogOut size={16} className="group-hover:-translate-x-1 transition-transform"/>
                  {isGuest ? 'Terminate Session' : 'Secure Logout'}
              </button>
          </div>
        </div>
      </div>
    );
  };
