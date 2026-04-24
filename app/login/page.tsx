'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { hasSupabaseEnv } from '@/lib/env';
import SetupRequired from '@/components/SetupRequired';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  if (!hasSupabaseEnv()) {
    return <SetupRequired />;
  }

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError('Check your email for the confirmation link. Or if email confirmation is disabled, you can now log in.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] flex-col p-4 text-[#E4E4E7]">
      <div className="max-w-md w-full bg-[#0A0A0B] rounded-none shadow-2xl p-8 border border-[#27272A]">
        <h1 className="text-2xl font-serif italic text-center text-[#D4AF37] mb-8 tracking-tight">MIOS Payroll</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all placeholder:text-zinc-600 font-mono text-sm"
              placeholder="you@company.com"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all placeholder:text-zinc-600 font-mono text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#18181B] text-red-500 font-mono text-xs border border-red-900">
              {error}
            </div>
          )}

          <div className="pt-4 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-yellow-600 text-[#0A0A0B] text-sm font-bold uppercase tracking-widest py-3 px-4 transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-[#0E0E10] border border-[#27272A] hover:bg-[#18181B] text-zinc-300 text-sm font-bold uppercase tracking-widest py-3 px-4 transition-all disabled:opacity-50"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
