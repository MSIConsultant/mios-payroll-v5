import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BULAN = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const fmt = (n: number) => n ? 'Rp ' + Math.round(n).toLocaleString('id-ID') : 'Rp 0';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: membership } = await supabase
    .from('workspace_members').select('workspace_id, workspaces(id, name)')
    .eq('user_id', user.id).limit(1).single();

  const workspaceId = membership?.workspace_id;
  const ws = membership?.workspaces;
  const wsName = (Array.isArray(ws) ? ws[0]?.name : (ws as any)?.name) ?? '—';

  const { data: companies } = await supabase
    .from('companies').select('id, name, kota, industri')
    .eq('workspace_id', workspaceId ?? '').eq('aktif', true);

  const companyIds = (companies ?? []).map(c => c.id);

  const { count: empCount } = companyIds.length > 0
    ? await supabase.from('employees').select('*', { count: 'exact', head: true })
        .in('company_id', companyIds).eq('aktif', true)
    : { count: 0 };

  const { data: recentRuns } = companyIds.length > 0
    ? await supabase.from('payroll_runs')
        .select('id, company_id, tahun, bulan, status, calculated_at')
        .in('company_id', companyIds)
        .order('calculated_at', { ascending: false }).limit(12)
    : { data: [] };

  const runIds = (recentRuns ?? []).map(r => r.id);
  const { data: runTotals } = runIds.length > 0
    ? await supabase.from('payroll_results').select('run_id, thp, bruto, pph').in('run_id', runIds)
    : { data: [] };

  const totalsMap: Record<string, { thp: number; bruto: number; pph: number; count: number }> = {};
  for (const r of runTotals ?? []) {
    if (!totalsMap[r.run_id]) totalsMap[r.run_id] = { thp: 0, bruto: 0, pph: 0, count: 0 };
    totalsMap[r.run_id].thp += r.thp ?? 0;
    totalsMap[r.run_id].bruto += r.bruto ?? 0;
    totalsMap[r.run_id].pph += r.pph ?? 0;
    totalsMap[r.run_id].count += 1;
  }

  const companyMap = Object.fromEntries((companies ?? []).map(c => [c.id, c]));
  const now = new Date();
  const runsThisMonth = (recentRuns ?? []).filter(r =>
    r.bulan === now.getMonth() + 1 && r.tahun === now.getFullYear()
  ).length;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 mb-1">Workspace Aktif</p>
        <h1 className="text-xl font-bold text-zinc-100">{wsName}</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Perusahaan', value: companies?.length ?? 0 },
          { label: 'Karyawan Aktif', value: empCount ?? 0 },
          { label: `Run ${BULAN[now.getMonth() + 1]} ${now.getFullYear()}`, value: runsThisMonth },
        ].map(s => (
          <div key={s.label} className="bg-[#111113] border border-[#1A1A1C] rounded-lg p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">{s.label}</p>
            <p className="text-3xl font-bold text-zinc-100 font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      {/* CLI Payroll Log */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 mb-3">Log Payroll</p>
        <div className="bg-[#080809] border border-[#1A1A1C] rounded-lg overflow-hidden font-mono">
          <div className="px-4 py-2 bg-[#0F0F11] border-b border-[#1A1A1C] flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
            <span className="ml-3 text-[10px] text-zinc-700 uppercase tracking-widest">payroll.log</span>
          </div>

          {(recentRuns ?? []).length === 0 ? (
            <div className="px-5 py-10 text-xs text-zinc-700">
              <span className="text-[#D4AF37]">$</span> Belum ada run.{' '}
              <Link href="/companies" className="text-sky-500 underline">Mulai dari sini →</Link>
            </div>
          ) : (
            <div>
              {(recentRuns ?? []).map((run, i) => {
                const t = totalsMap[run.id];
                const co = companyMap[run.company_id];
                return (
                  <Link
                    key={run.id}
                    href={`/companies/${run.company_id}/payroll/${run.tahun}/${run.bulan}`}
                    className={`block px-5 py-3.5 hover:bg-[#0F0F11] transition-colors ${i < (recentRuns ?? []).length - 1 ? 'border-b border-[#131315]' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-300">
                        <span className="text-[#D4AF37]">$</span>{' '}
                        <span className="font-bold">{co?.name ?? '—'}</span>
                        <span className="text-zinc-700"> ── {BULAN[run.bulan]} {run.tahun}</span>
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-widest ${
                        run.status === 'locked' ? 'bg-green-900/30 text-green-500' :
                        run.status === 'calculated' ? 'bg-sky-900/30 text-sky-400' :
                        'bg-zinc-800 text-zinc-600'
                      }`}>{run.status}</span>
                    </div>
                    {t ? (
                      <div className="pl-3 grid grid-cols-4 gap-x-4 text-[11px]">
                        <span><span className="text-zinc-700">karyawan  </span><span className="text-zinc-400">{t.count}</span></span>
                        <span><span className="text-zinc-700">bruto     </span><span className="text-zinc-300">{fmt(t.bruto)}</span></span>
                        <span><span className="text-zinc-700">pph21     </span><span className="text-amber-400">{fmt(t.pph)}</span></span>
                        <span><span className="text-zinc-700">thp       </span><span className="text-green-400">{fmt(t.thp)}</span></span>
                      </div>
                    ) : (
                      <p className="pl-3 text-[11px] text-zinc-700">── belum ada hasil tersimpan</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Company Quick Links */}
      {(companies ?? []).length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700 mb-3">Perusahaan</p>
          <div className="grid grid-cols-2 gap-2">
            {(companies ?? []).slice(0, 6).map(co => (
              <Link key={co.id} href={`/companies/${co.id}`}
                className="flex items-center justify-between bg-[#111113] border border-[#1A1A1C] rounded-lg px-4 py-3 hover:border-[#D4AF37]/30 hover:bg-[#131315] transition-all group">
                <div>
                  <p className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">{co.name}</p>
                  <p className="text-[10px] text-zinc-700 mt-0.5">{co.kota ?? co.industri ?? '—'}</p>
                </div>
                <ArrowRight size={13} className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
