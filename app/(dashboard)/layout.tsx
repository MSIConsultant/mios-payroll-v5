import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/env';
import SetupRequired from '@/components/SetupRequired';
import NavLinks from '@/components/layout/NavLinks';
import { Toaster } from 'sonner';
import { LogOut } from 'lucide-react';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex h-screen bg-[#0D0D0F] overflow-hidden text-zinc-100">
      {/* Sidebar */}
      <aside className="w-52 bg-[#080809] border-r border-[#1A1A1C] flex flex-col flex-shrink-0 relative">
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />

        {/* Logo */}
        <div className="px-4 py-5 border-b border-[#1A1A1C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#D4AF37] rounded flex items-center justify-center shrink-0 relative"
              style={{ boxShadow: '0 0 20px rgba(212,175,55,0.25)' }}>
              <span className="text-[#0A0A0B] font-black text-sm">M</span>
            </div>
            <div>
              <p className="font-bold text-zinc-100 text-sm leading-none tracking-tight">MIOS Payroll</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-mono">sistem aktif</p>
              </div>
            </div>
          </div>
        </div>

        <NavLinks />

        {/* User */}
        <div className="p-3 border-t border-[#1A1A1C] mt-auto">
          <div className="px-2 py-2 mb-1">
            <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-mono mb-0.5">operator</p>
            <p className="text-[11px] text-zinc-500 truncate font-mono">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-zinc-700 hover:text-red-400 hover:bg-[#111113] rounded-lg transition-all font-mono uppercase tracking-widest">
              <LogOut size={12} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main — with ambient grid texture */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Ambient grid — very subtle, same as login */}
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          backgroundImage: 'linear-gradient(rgba(212,175,55,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.015) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          left: '208px',
        }} />
        {/* Scanline — single pass, very subtle */}
        <div className="animate-scanline fixed pointer-events-none z-0 w-full h-12 bg-white/[0.012]"
          style={{ left: '208px' }} />

        <div className="relative z-10 p-8 min-h-full">
          {children}
        </div>
      </main>

      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#111113',
            border: '1px solid #1A1A1C',
            color: '#e4e4e7',
            fontFamily: 'ui-monospace, monospace',
            fontSize: '12px',
          },
        }}
      />
    </div>
  );
}
