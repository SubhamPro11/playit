import React, { useState } from 'react';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

interface AdminLoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  error: string | null;
  loading: boolean;
  onBackToPublic: () => void;
  isSupabaseConfigured: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLogin,
  error,
  loading,
  onBackToPublic,
  isSupabaseConfigured,
}) => {
  const [username, setUsername] = useState('morbius');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (username.trim().toLowerCase() !== 'morbius') {
      setLocalError('Invalid admin account');
      return;
    }

    if (!password) {
      setLocalError('Please enter admin password');
      return;
    }

    await onLogin(username.trim(), password);
  };

  const displayedError = localError || error;

  return (
    <div className="min-h-screen bg-[#08080a] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Subtle red glow in background */}
      <div className="absolute top-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back action */}
      <button
        onClick={onBackToPublic}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to showcase</span>
      </button>

      {/* Card Container */}
      <div className="w-full max-w-md bg-[#111114] border border-[#27272a] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo />
          <h2 className="mt-4 font-sans font-bold text-lg text-white">
            Admin console
          </h2>
          <p className="font-mono text-xs text-zinc-400 mt-1">
            Gated management console
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-mono leading-relaxed">
              Supabase credentials not detected in .env. Falling back to local admin verification.
            </p>
          </div>
        )}

        {displayedError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
            {displayedError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#0a0a0d] text-white rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-mono text-xs transition-colors"
              placeholder="Username"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-[#0a0a0d] text-white rounded-xl border border-[#27272a] focus:border-red-500 focus:outline-none font-mono text-xs transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/50"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Sign in to admin'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#27272a] text-center">
          <p className="text-[11px] font-mono text-zinc-500">
            Protected area · authorized access only
          </p>
        </div>
      </div>
    </div>
  );
};
