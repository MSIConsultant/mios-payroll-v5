'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Company, Employee } from '@/lib/types';
import { Users, Plus, Search, ArrowLeft, ChevronRight, Calendar } from 'lucide-react';
import { formatRupiah } from '@/lib/format';

const BULAN = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [lastRun, setLastRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [{ data: co }, { data: emps }, { data: run }] = await Promise.all([
        supabase.from('companies').select('*').eq('id', companyId).single(),
        supabase.from('employees').select('*').eq('company_id', companyId).eq('aktif', true).order('nama'),
        supabase.from('payroll_runs').select('*').eq('company_id', companyId)
          .order('tahun', { ascending: false }).order('bulan', { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (co) setCompany(co);
      if (emps) setEmployees(emps);
      if (run) setLastRun(run);
      setLoading(false);
    }
    if (companyId) fetchData();
  }, [companyId]);

  const filtered = employees.filter(e =>
    e.nama.toLowerCase().includes(search.toLowerCase()) ||
    e.nik.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3,4].map(i => <div key={i} className="h-14 bg-[#111113] border border-[#1A1A1C] rounded-lg animate-pulse" />)}
    </div>
  );
  if (!company) return <div className="text-zinc-600 text-sm">Perusahaan tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/companies"
            className="w-9 h-9 bg-[#111113] border border-[#1A1A1C] rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-zinc-100">{company.name}</h1>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-green-900/25 text-green-400 border border-green-900/40 uppercase tracking-widest">Aktif</span>
            </div>
            <p className="text-[11px] text-zinc-600 mt-0.5">{company.industri ?? '—'} · {company.kota ?? '—'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/companies/${companyId}/payroll`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#1A1A1C] text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-[#D4AF37]/30 hover:text-zinc-200 transition-colors">
            <Calendar size={13} />
            Payroll
          </Link>
          <Link href={`/companies/${companyId}/employees/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0B] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#c9a32e] transition-colors">
            <Plus size={13} />
            Karyawan
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111113] border border-[#1A1A1C] rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Karyawan Aktif</p>
          <p className="text-2xl font-bold text-zinc-100 font-mono">{employees.length}</p>
        </div>
        <div className="bg-[#111113] border border-[#1A1A1C] rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Payroll Terakhir</p>
          <p className="text-sm font-bold text-zinc-200">{lastRun ? `${BULAN[lastRun.bulan]} ${lastRun.tahun}` : '—'}</p>
          {lastRun && <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-0.5">{lastRun.status}</p>}
        </div>
        <div className="bg-[#111113] border border-[#1A1A1C] rounded-lg p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Est. Bruto Bulanan</p>
          <p className="text-sm font-bold text-zinc-200 font-mono">
            {formatRupiah(employees.reduce((a, e) => a + (e.gaji_pokok ?? 0) + (e.benefit ?? 0), 0))}
          </p>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-[#111113] border border-[#1A1A1C] rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#1A1A1C] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={13} className="text-zinc-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Karyawan</span>
          </div>
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-700" />
            <input type="text" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 bg-[#0D0D0F] border border-[#1A1A1C] rounded text-xs text-zinc-300 placeholder:text-zinc-700 outline-none focus:border-[#D4AF37]/30 transition-colors w-40" />
          </div>
        </div>

        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="border-b border-[#1A1A1C] text-[10px] uppercase tracking-widest text-zinc-700">
              <th className="px-5 py-3 text-left">Nama</th>
              <th className="px-5 py-3 text-left">Tipe</th>
              <th className="px-5 py-3 text-left">PTKP / NPWP</th>
              <th className="px-5 py-3 text-right">Gaji Pokok</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-zinc-700">
                {search ? 'Tidak ditemukan' : 'Belum ada karyawan — tambah di atas'}
              </td></tr>
            ) : filtered.map(emp => (
              <tr key={emp.id} onClick={() => router.push(`/companies/${companyId}/employees/${emp.id}`)}
                className="border-b border-[#131315] hover:bg-[#131315] cursor-pointer transition-colors group">
                <td className="px-5 py-3">
                  <p className="text-zinc-200 font-bold text-[11px] uppercase group-hover:text-[#D4AF37] transition-colors">{emp.nama}</p>
                  <p className="text-zinc-700 text-[10px]">#{emp.nik}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                    emp.jenis_karyawan === 'tetap' ? 'bg-sky-900/25 text-sky-400' : 'bg-zinc-800 text-zinc-500'
                  }`}>{emp.jenis_karyawan === 'tetap' ? 'Tetap' : 'TT'}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">{emp.status_ptkp}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                      emp.punya_npwp ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'
                    }`}>{emp.punya_npwp ? 'NPWP ✓' : 'NO NPWP'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right text-zinc-400">{formatRupiah(emp.gaji_pokok)}</td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight size={13} className="text-zinc-700 group-hover:text-zinc-400 inline transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
