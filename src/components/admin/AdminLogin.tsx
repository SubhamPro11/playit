import React, { useState } from 'react';
import { Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleUsernameChange = (val: string) => {
    setUsername(val);
    if (localError) setLocalError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (localError) setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setLocalError('Please enter admin username or email');
      return;
    }

    if (!password) {
      setLocalError('Please enter admin password');
      return;
    }

    await onLogin(trimmed, password);
  };

  const displayedError = localError || error;

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Ambient warm amber glow in background */}
      <div className="absolute top-1/4 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top back navigation */}
      <button
        onClick={onBackToPublic}
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg bg-surface-850/50 hover:bg-surface-800 border border-surface-700/50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to showcase</span>
      </button>

      {/* Card Container */}
      <div className="w-full max-w-md bg-surface-850 border border-surface-700 rounded-xl p-6 sm:p-8 shadow-2xl relative z-10">
        
        {/* Header with Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <BrandLogo />
          <h1 className="mt-4 font-sans font-bold text-xl text-white">
            Admin console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gated management & playlist control
          </p>
        </div>

        {/* Fallback Notice */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-start gap-2.5 text-accent-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-accent-400" />
            <p className="leading-relaxed">
              Supabase credentials not detected in .env. Falling back to local admin verification.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {displayedError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-red-300 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <p className="leading-relaxed font-medium">{displayedError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 font-medium uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              autoComplete="username"
              disabled={loading}
              placeholder="Username or email"
              className="w-full px-3.5 py-2.5 bg-surface-900 text-slate-100 placeholder:text-slate-500 rounded-xl border border-surface-700 focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none text-xs transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 font-medium uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-surface-900 text-slate-100 placeholder:text-slate-500 rounded-xl border border-surface-700 focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30 focus:outline-none text-xs transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-400 active:bg-accent-600 text-surface-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in to admin</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-700/80 text-center">
          <p className="text-xs text-slate-500 font-mono">
            Protected area · authorized access only
          </p>
        </div>
      </div>
    </div>
  );
};

