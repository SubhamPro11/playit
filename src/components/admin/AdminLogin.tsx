import React, { useState } from 'react';
import { Lock, ArrowLeft } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim()) {
      setLocalError('Username is required');
      return;
    }
    if (!password) {
      setLocalError('Password is required');
      return;
    }

    await onLogin(username.trim(), password);
  };

  const displayedError = error || localError;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#0b0f19] text-[#e2e8f0]">
      <div className="w-full max-w-sm">
        {/* Back to Public Playlist Link */}
        <button
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to playlist</span>
        </button>

        {/* Login Card with rounded-2xl */}
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 sm:p-7 shadow-xl">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[#131d33] border border-[#1e293b] flex items-center justify-center text-lime-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-lg text-slate-100 leading-tight">
                Admin console
              </h1>
              <p className="font-mono text-[11px] text-slate-500">
                Single playlist management
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2 mb-6">
            Sign in with your admin credentials to manage playlist entries, categories, and ordering.
          </p>

          {displayedError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {displayedError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="morbius"
                autoComplete="username"
                className="w-full px-3.5 py-2 bg-[#0b0f19] text-sm text-slate-200 placeholder:text-slate-600 rounded-xl border border-[#1e293b] focus:border-lime-400 focus:outline-none font-sans transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-3.5 py-2 bg-[#0b0f19] text-sm text-slate-200 placeholder:text-slate-600 rounded-xl border border-[#1e293b] focus:border-lime-400 focus:outline-none font-sans transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-500 active:bg-lime-400 text-black font-semibold font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {!isSupabaseConfigured && (
            <div className="mt-5 pt-4 border-t border-[#1e293b]/70 text-[11px] font-mono text-slate-500">
              <span className="text-slate-400 font-semibold">Admin account:</span>
              <div className="mt-0.5">Username: morbius</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
