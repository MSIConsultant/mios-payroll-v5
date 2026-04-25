import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, Users, ArrowRight } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name)')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  const workspaceId = membership?.workspace_id;

  // Count companies
  const { count: companyCount } = await supabase
    .from('companies')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId ?? '');

  // Count employees
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .eq('workspace_id', workspaceId ?? '');

  const companyIds = (companies ?? []).map((c) => c.id);

  const { count: employeeCount } = companyIds.length > 0
    ? await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .in('company_id', companyIds)
        .eq('aktif', true)
    : { count: 0 };

  const workspace = membership?.workspaces as { name: string } | null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">Workspace</p>
        <h1 className="text-2xl font-serif italic text-[#E4E4E7]">{workspace?.name ?? 'Dashboard'}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#0A0A0B] border border-[#27272A] p-6 rounded-sm">
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={18} className="text-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Perusahaan</span>
          </div>
          <p className="text-4xl font-bold text-[#E4E4E7]">{companyCount ?? 0}</p>
        </div>

        <div className="bg-[#0A0A0B] border border-[#27272A] p-6 rounded-sm">
          <div className="flex items-center gap-3 mb-3">
            <Users size={18} className="text-[#D4AF37]" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Karyawan Aktif</span>
          </div>
          <p className="text-4xl font-bold text-[#E4E4E7]">{employeeCount ?? 0}</p>
        </div>
      </div>

      <Link
        href="/companies"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-white transition-colors"
      >
        Lihat Semua Perusahaan <ArrowRight size={14} />
      </Link>
    </div>
  );
}
