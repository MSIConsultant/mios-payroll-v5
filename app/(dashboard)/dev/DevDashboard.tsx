'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Terminal, Database, Users, Building2, Calculator,
  Trash2, RefreshCw, Download, Shield, AlertTriangle,
  ChevronDown, ChevronRight, Eye, Copy, Check
} from 'lucide-react';

const TABLES = ['workspaces','workspace_members','workspace_invitations','workspace_activity','companies','employees','employee_events','payroll_runs','payroll_results'];

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#0A0A0B] border border-[#1A1A1C] rounded-lg overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#0F0F11] transition-colors">
        <div className="flex items-center gap-3">
          <Icon size={14} className="text-[#D4AF37]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 font-mono">{title}</span>
        </div>
        {open ? <ChevronDown size={13} className="text-zinc-700" /> : <ChevronRight size={13} className="text-zinc-700" />}
      </button>
      {open && <div className="border-t border-[#1A1A1C] p-5">{children}</div>}
    </div>
  );
}

function Stat({ label, value, color = 'text-zinc-100' }: { label: string; value: any; color?: string }) {
  return (
    <div className="bg-[#0D0D0F] border border-[#1A1A1C] rounded p-4">
      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700 mb-2 font-mono">{label}</p>
      <p className={`text-2xl font-black font-mono ${color}`}>{value}</p>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => {
      await navigator.clipboard.writeText(text);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    }} className="p-1 text-zinc-700 hover:text-[#D4AF37] transition-colors">
      {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
    </button>
  );
}

export default function DevDashboard({ userEmail }: { userEmail: string }) {
  const [stats, setStats]         = useState<Record<string, number>>({});
  const [tableData, setTableData] = useState<Record<string, any[]>>({});
  const [viewTable, setViewTable] = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);
  const [engineResult, setEngineResult] = useState<any>(null);
  const [engineInput, setEngineInput]   = useState(JSON.stringify({
    nama: 'Test Employee', nik: '1234567890123456', npwp: '000.000.000.0-000.000',
    bulan: 1, tahun: 2026, status_ptkp: 'TK0', punya_npwp: true,
    gaji_pokok: 9150000, benefit: 0, kendaraan: 0, pulsa: 0, operasional: 0, tunj_lain: 0,
    thr: 0, bonus: 0, ikut_jht: true, ikut_jp: true, ikut_jkp: false,
    jkk_rate: 0.0024, tanggung_jht_k: true, tanggung_jp_k: true,
    ikut_kes: true, tanggung_kes_k: true, pph_ditanggung: false,
    kasbon: 0, alpha_telat: 0, pot_lain: 0, pph_jan_nov: 0, akum_bruto: 0,
    divisi: 'Dev', jenis_kelamin: 'L',
  }, null, 2));

  async function fetchStats() {
    setLoading(true);
    const supabase = createClient();
    const results: Record<string, number> = {};
    await Promise.all(TABLES.map(async t => {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true });
      results[t] = count ?? 0;
    }));
    setStats(results);
    setLoading(false);
  }

  useEffect(() => { fetchStats(); }, []);

  async function fetchTable(table: string) {
    const supabase = createClient();
    const { data } = await supabase.from(table).select('*').limit(50).order('created_at', { ascending: false });
    setTableData(td => ({ ...td, [table]: data ?? [] }));
    setViewTable(table);
  }

  async function clearTable(table: string) {
    if (!confirm(`DELETE ALL rows from ${table}? This cannot be undone.`)) return;
    const supabase = createClient();
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) toast.error(error.message);
    else { toast.success(`${table} cleared`); fetchStats(); }
  }

  async function runEngineTest() {
    try {
      const input = JSON.parse(engineInput);
      const { calculateMonthlySalary } = await import('@/lib/engine/payroll');
      const result = calculateMonthlySalary(input);
      setEngineResult(result);
      toast.success('Engine ran successfully');
    } catch (e: any) {
      toast.error(e.message);
      setEngineResult({ error: e.message });
    }
  }

  async function exportTableCSV(table: string) {
    const supabase = createClient();
    const { data } = await supabase.from(table).select('*').limit(1000);
    if (!data || data.length === 0) { toast.error('No data'); return; }
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${table}_${Date.now()}.csv`;
    a.click();
    toast.success(`${table} exported`);
  }

  const totalRows = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-5xl space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="border-b border-[#1A1A1C] pb-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 font-mono">Dev Mode — Restricted Access</p>
        </div>
        <h1 className="text-3xl font-black text-zinc-100 font-mono">DEV CONSOLE</h1>
        <p className="text-[11px] text-zinc-700 font-mono mt-1">{userEmail} · MIOS Payroll v5</p>
      </div>

      {/* DB Stats */}
      <Section title="Database Overview" icon={Database} defaultOpen>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Total Rows" value={loading ? '...' : totalRows} color="text-[#D4AF37]" />
          <Stat label="Tables" value={TABLES.length} />
          <Stat label="Status" value={loading ? 'loading' : 'connected'} color="text-green-400" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TABLES.map(t => (
            <div key={t} className="bg-[#0D0D0F] border border-[#1A1A1C] rounded p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-mono text-zinc-500 truncate">{t}</p>
                <p className="text-xl font-black font-mono text-zinc-200">{loading ? '—' : stats[t] ?? 0}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => fetchTable(t)} title="View"
                  className="p-1.5 text-zinc-700 hover:text-sky-400 transition-colors">
                  <Eye size={11} />
                </button>
                <button onClick={() => exportTableCSV(t)} title="Export CSV"
                  className="p-1.5 text-zinc-700 hover:text-[#D4AF37] transition-colors">
                  <Download size={11} />
                </button>
                <button onClick={() => clearTable(t)} title="Clear table"
                  className="p-1.5 text-zinc-700 hover:text-red-400 transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Table viewer */}
        {viewTable && tableData[viewTable] && (
          <div className="mt-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 font-mono">
                {viewTable} ({tableData[viewTable].length} rows)
              </p>
              <button onClick={() => setViewTable(null)} className="text-[10px] text-zinc-700 hover:text-zinc-400 font-mono">× close</button>
            </div>
            <div className="overflow-x-auto">
              <div className="bg-[#060607] border border-[#1A1A1C] rounded-lg overflow-hidden font-mono text-[10px]">
                {tableData[viewTable].length === 0 ? (
                  <p className="px-4 py-6 text-zinc-700">$ empty table</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1A1A1C] bg-[#0A0A0B]">
                        {Object.keys(tableData[viewTable][0]).slice(0, 8).map(k => (
                          <th key={k} className="px-3 py-2 text-left text-zinc-700 uppercase tracking-wider whitespace-nowrap">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData[viewTable].slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b border-[#0F0F11] hover:bg-[#0A0A0B] transition-colors">
                          {Object.values(row).slice(0, 8).map((val: any, j) => (
                            <td key={j} className="px-3 py-2 text-zinc-500 whitespace-nowrap max-w-[160px] truncate">
                              {val === null ? <span className="text-zinc-800">null</span> :
                               typeof val === 'object' ? <span className="text-zinc-700">{'{…}'}</span> :
                               String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </Section>

      {/* Payroll Engine Tester */}
      <Section title="Payroll Engine Tester" icon={Calculator}>
        <p className="text-[11px] text-zinc-600 font-mono mb-4">
          Test calculateMonthlySalary() live. Edit input JSON, click Run.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-700 mb-2 font-mono">Input JSON</p>
            <textarea
              value={engineInput}
              onChange={e => setEngineInput(e.target.value)}
              rows={20}
              className="w-full px-3 py-2.5 bg-[#060607] border border-[#1A1A1C] rounded-lg text-[11px] text-zinc-300 font-mono outline-none focus:border-[#D4AF37]/30 resize-none"
            />
            <button onClick={runEngineTest}
              className="mt-3 w-full py-2.5 bg-[#D4AF37] text-[#0A0A0B] rounded-lg font-black text-xs uppercase tracking-widest hover:bg-[#c9a32e] transition-colors flex items-center justify-center gap-2">
              <Terminal size={13} />
              $ run engine
            </button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-widest text-zinc-700 font-mono">Output</p>
              {engineResult && <CopyButton text={JSON.stringify(engineResult, null, 2)} />}
            </div>
            <div className="bg-[#060607] border border-[#1A1A1C] rounded-lg p-3 h-[490px] overflow-y-auto font-mono text-[11px]">
              {!engineResult ? (
                <p className="text-zinc-800">$ waiting for input...</p>
              ) : engineResult.error ? (
                <pre className="text-red-400 whitespace-pre-wrap">{JSON.stringify(engineResult, null, 2)}</pre>
              ) : (
                <div className="space-y-1">
                  {[
                    ['bruto',         engineResult.bruto,         'text-zinc-100'],
                    ['ter_rate',      engineResult.ter != null ? `${(engineResult.ter*100).toFixed(2)}%` : 'Pasal 17', 'text-sky-400'],
                    ['pph21',         engineResult.pph,           'text-amber-400'],
                    ['tunj_pph',      engineResult.tunj_pph,      'text-amber-300'],
                    ['thp',           engineResult.thp,           'text-green-400'],
                    ['bpjs.employer_in_bruto', engineResult.bpjs?.employer_in_bruto, 'text-zinc-400'],
                    ['bpjs.karyawan_tunj',     engineResult.bpjs?.karyawan_tunj,     'text-zinc-400'],
                    ['bpjs.karyawan_potong',   engineResult.bpjs?.karyawan_potong,   'text-red-400'],
                  ].filter(([,v]) => v !== undefined && v !== null).map(([label, val, color]) => (
                    <div key={label as string} className="flex justify-between py-0.5 border-b border-[#0F0F11]">
                      <span className="text-zinc-700">{label as string}</span>
                      <span className={color as string}>{typeof val === 'number' ? ('Rp ' + Math.round(val as number).toLocaleString('id-ID')) : String(val)}</span>
                    </div>
                  ))}
                  <details className="mt-3">
                    <summary className="text-[10px] text-zinc-700 cursor-pointer hover:text-zinc-500">full output JSON</summary>
                    <pre className="text-[10px] text-zinc-600 mt-2 whitespace-pre-wrap">{JSON.stringify(engineResult, null, 2)}</pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Quick Actions */}
      <Section title="Quick Actions" icon={Terminal}>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: 'Refresh Stats',
              desc: 'Re-fetch all table counts',
              icon: RefreshCw,
              color: 'hover:border-sky-900/50 hover:text-sky-400',
              action: fetchStats,
            },
            {
              label: 'Export All Payroll Results',
              desc: 'Download payroll_results as CSV',
              icon: Download,
              color: 'hover:border-[#D4AF37]/30 hover:text-[#D4AF37]',
              action: () => exportTableCSV('payroll_results'),
            },
            {
              label: 'Export All Employees',
              desc: 'Download employees as CSV',
              icon: Users,
              color: 'hover:border-green-900/40 hover:text-green-400',
              action: () => exportTableCSV('employees'),
            },
            {
              label: 'Export Activity Log',
              desc: 'Download workspace_activity as CSV',
              icon: Shield,
              color: 'hover:border-amber-900/40 hover:text-amber-400',
              action: () => exportTableCSV('workspace_activity'),
            },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className={`bg-[#0D0D0F] border border-[#1A1A1C] rounded-lg p-4 text-left transition-all ${item.color} group`}>
              <div className="flex items-center gap-3 mb-2">
                <item.icon size={13} className="text-zinc-700 group-hover:text-current transition-colors" />
                <p className="text-[11px] font-bold uppercase tracking-widest font-mono text-zinc-400 group-hover:text-current transition-colors">{item.label}</p>
              </div>
              <p className="text-[10px] text-zinc-700 font-mono">{item.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Danger Zone */}
      <Section title="Danger Zone" icon={AlertTriangle}>
        <div className="space-y-2">
          <p className="text-[11px] text-red-500/60 font-mono mb-4">
            <span className="text-red-500">WARNING:</span> These actions are irreversible and affect all workspace data.
          </p>
          {[
            { label: 'Clear All Payroll Results', table: 'payroll_results', desc: 'Deletes all calculated payroll data' },
            { label: 'Clear All Payroll Runs',    table: 'payroll_runs',    desc: 'Deletes all run records' },
            { label: 'Clear All Events',          table: 'employee_events', desc: 'Deletes THR, bonus, event data' },
            { label: 'Clear Activity Log',        table: 'workspace_activity', desc: 'Clears audit trail' },
          ].map(item => (
            <div key={item.table} className="flex items-center justify-between bg-[#0F0A0A] border border-red-900/20 rounded-lg px-4 py-3">
              <div>
                <p className="text-[11px] font-bold text-zinc-400 font-mono">{item.label}</p>
                <p className="text-[10px] text-zinc-700 font-mono">{item.desc}</p>
              </div>
              <button onClick={() => clearTable(item.table)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900/20 border border-red-900/30 text-red-500/60 hover:text-red-400 hover:border-red-800/50 rounded text-[10px] font-bold uppercase tracking-widest font-mono transition-colors">
                <Trash2 size={10} />
                Run
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* Build Info */}
      <div className="bg-[#060607] border border-[#1A1A1C] rounded-lg p-4 font-mono text-[10px] text-zinc-800">
        <p>$ mios-payroll-v5 · next.js 15 · supabase · vercel</p>
        <p>$ pp 58/2023 · pmk 168/2023 · ter method · pasal 17 dec equalization</p>
        <p>$ dev: {userEmail}</p>
        <p>$ built: {new Date().toISOString().split('T')[0]}</p>
      </div>
    </div>
  );
}
