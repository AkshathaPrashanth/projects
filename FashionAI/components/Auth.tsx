import React, { useState } from 'react';
import { Layers, Mail, Lock, User, UserPlus, LogIn, ChevronLeft } from 'lucide-react';
import { db } from '../services/databaseService';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (role: 'designer' | 'admin', name: string, email: string) => void;
  onClose: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState(''); // Combined field for Login
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    try {
      // Speed up login by checking local user list first or shortening backend wait
      const existingUsers = await db.getUsers();

      if (isSignUp) {
        if (!name.trim()) {
          setError('A unique username or name is required for registration.');
          setIsProcessing(false);
          return;
        }
        if (!email.trim()) {
          setError('Email is required for registration.');
          setIsProcessing(false);
          return;
        }

        const nameTaken = existingUsers.some(u => u.name.toLowerCase() === name.trim().toLowerCase());
        const emailTaken = existingUsers.some(u => u.email.toLowerCase() === email.trim().toLowerCase());

        if (nameTaken) {
          setError('This username is already taken. Please choose a different one.');
          setIsProcessing(false);
          return;
        }
        if (emailTaken) {
          setError('An account with this email already exists.');
          setIsProcessing(false);
          return;
        }

        const newUserRole = email.toLowerCase() === 'admin@fashion.ai' ? 'admin' : 'designer';
        const newUserId = `user-${Date.now()}`;
        const newUser: UserType = {
          id: newUserId,
          name: name.trim(),
          email: email.trim(),
          role: newUserRole as 'designer' | 'admin',
          lastLogin: Date.now()
        };

        await db.saveUser(newUser);
        
        // Non-blocking log
        db.logActivity(newUserId, newUser.name, 'Account Created', 'New designer joined the studio', 'success');
        
        onLogin(newUser.role, newUser.name, newUser.email);
      } else {
        // LOGIN MODE
        if (!identifier.trim()) {
          setError('Email or Username is required to sign in.');
          setIsProcessing(false);
          return;
        }

        // Hardcoded Admin fast-path
        const isAdmin = identifier.toLowerCase() === 'admin@fashion.ai' && password === 'admin123';
        
        // Find existing user
        const foundUser = existingUsers.find(u => 
          u.email.toLowerCase() === identifier.trim().toLowerCase() || 
          u.name.toLowerCase() === identifier.trim().toLowerCase()
        );

        if (foundUser || isAdmin) {
          const userToLog = foundUser || {
            id: 'admin-root',
            name: 'System Admin',
            email: 'admin@fashion.ai',
            role: 'admin'
          };

          // Non-blocking log - trigger and proceed immediately
          db.logActivity(
            userToLog.id,
            userToLog.name,
            'Session Login',
            `Authenticated via ${isAdmin ? 'Admin Portal' : 'Email/Username Credential'}`,
            'success'
          );

          onLogin(userToLog.role as 'designer' | 'admin', userToLog.name, userToLog.email);
        } else {
          setError('Invalid credentials. User not found.');
          setIsProcessing(false);
        }
      }
    } catch (err) {
      setError('Connection failed. Please check your credentials or network.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden animate-fade-in">
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 overflow-hidden bg-slate-50 border-r border-slate-100">
        <div className="relative z-10 text-center max-w-md animate-zoom-in">
          <div className="mb-8 inline-flex p-8 rounded-[3rem] text-white shadow-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] transform hover:scale-105 transition-transform">
            <Layers size={48} />
          </div>
          <h2 className="text-3xl font-serif font-bold mb-4 text-slate-800">
            {isSignUp ? 'Join the Atelier' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed font-light">
            {isSignUp 
              ? 'Create your professional design profile to start persisting your textile DNA to our cloud cluster.' 
              : 'Enter your studio credentials to access your saved patterns and technical library.'}
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 md:p-24 bg-white relative">
        <button 
          onClick={onClose}
          className="absolute top-8 left-8 p-2 text-slate-300 hover:text-slate-500 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Studio
        </button>

        <div className="max-w-md w-full mx-auto space-y-8 animate-fade-in-up">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-serif font-bold text-slate-800">
              {isSignUp ? 'Create New Account' : 'Sign In'}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Access the FashionDesignAI Cloud Platform</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rose-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp ? (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Unique Username</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[var(--primary)] transition-colors" size={16} />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. McQueen_2025" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[var(--primary)]/20 focus:bg-white transition-all text-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[var(--primary)] transition-colors" size={16} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="name@fashion.ai" 
                      required 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[var(--primary)]/20 focus:bg-white transition-all text-sm" 
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Email or Username</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[var(--primary)] transition-colors" size={16} />
                  <input 
                    type="text" 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)} 
                    placeholder="Enter email or username" 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[var(--primary)]/20 focus:bg-white transition-all text-sm" 
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-[var(--primary)] transition-colors" size={16} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-[var(--primary)]/20 focus:bg-white transition-all text-sm" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              className={`w-full py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] text-white shadow-xl transform active:scale-95 transition-all flex items-center justify-center gap-3
                ${isProcessing ? 'bg-slate-100 text-slate-300' : 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:shadow-orange-500/30'}`}
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full"></div>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>
          
          <div className="pt-6 border-t border-slate-50 text-center">
            <button 
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-[var(--primary)] transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need a professional profile? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;