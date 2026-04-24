import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/env';
import SetupRequired from '@/components/SetupRequired';
import Link from 'next/link';
import { LogOut, Users, Calculator, LayoutDashboard } from 'lucide-react';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) {
    return <SetupRequired />;
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden text-[#E4E4E7]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0B] border-r border-[#27272A] flex flex-col">
        <div className="p-8 border-b border-[#27272A] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4AF37] rounded-sm flex items-center justify-center shrink-0">
            <span className="text-[#0A0A0B] font-bold">M</span>
          </div>
          <h1 className="text-xl font-serif italic tracking-tight text-[#E4E4E7]">MIOS Payroll</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center gap-3 p-3 text-zinc-400 hover:bg-[#18181B] transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#D4AF37]">
            <LayoutDashboard size={20} className="opacity-50" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link href="/employees" className="flex items-center gap-3 p-3 text-zinc-400 hover:bg-[#18181B] transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#D4AF37]">
            <Users size={20} className="opacity-50" />
            <span className="text-sm font-medium">Employees</span>
          </Link>
          <Link href="/payroll" className="flex items-center gap-3 p-3 text-zinc-400 hover:bg-[#18181B] transition-colors cursor-pointer border-l-2 border-transparent hover:border-[#D4AF37]">
            <Calculator size={20} className="opacity-50" />
            <span className="text-sm font-medium">Run Payroll</span>
          </Link>
        </nav>

        <div className="mt-auto p-6 border-t border-[#27272A] bg-[#0E0E10]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 truncate">{session.user.email}</p>
              <p className="text-sm font-medium truncate">System User</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-2 text-zinc-500 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors w-full p-2 bg-[#18181B] justify-center hover:bg-[#050505] border border-[#27272A]">
              <LogOut size={16} />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#050505]">
        {children}
      </main>
    </div>
  );
}
