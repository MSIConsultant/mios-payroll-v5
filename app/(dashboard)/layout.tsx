import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/env';
import SetupRequired from '@/components/SetupRequired';
import NavLinks from '@/components/layout/NavLinks';
import { LogOut } from 'lucide-react';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) return <SetupRequired />;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex h-screen bg-[#0D0D0F] overflow-hidden text-zinc-100">
      <aside className="w-56 bg-[#0A0A0B] border-r border-[#1A1A1C] flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-[#1A1A1C] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4AF37] rounded flex items-center justify-center shrink-0">
            <span className="text-[#0A0A0B] font-black text-sm">M</span>
          </div>
          <div>
            <p className="font-bold text-zinc-100 text-sm leading-none">MIOS Payroll</p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">Indonesia</p>
          </div>
        </div>

        <NavLinks />

        <div className="p-3 border-t border-[#1A1A1C] mt-auto">
          <div className="px-2 py-2 mb-1">
            <p className="text-[10px] text-zinc-600 truncate">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 hover:text-red-400 hover:bg-[#111113] rounded-lg transition-all">
              <LogOut size={13} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
