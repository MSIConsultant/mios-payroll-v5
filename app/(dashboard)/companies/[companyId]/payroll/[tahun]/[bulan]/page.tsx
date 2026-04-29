'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  ArrowLeft, 
  Calculator, 
  Save, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  User,
  Info
} from 'lucide-react';
import { ArrowLeft, Calculator, Save, Lock } from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { calculateMonthlySalary, calculateTHRBonus, calculateFreelance } from '@/lib/engine/payroll';
import { calculateMonthlySalary, calculateFreelance } from '@/lib/engine/payroll';
import { savePayrollRun, lockPayrollRun } from '@/lib/actions/payroll';

const BULAN_NAMES = ['Januari','Februari','Maret','April','Mei','Jun','Jul','Agustus','September','Oktober','November','Desember'];
const sep = '─'.repeat(38);

function CliRow({ label, value, color }: { label: string; value: string; color?: string }) {
  const c = color ?? 'text-zinc-300';
  return (
    <div className="flex justify-between text-[11px] py-0.5">
      <span className="text-zinc-600 font-mono">{label.padEnd(22, ' ')}</span>
      <span className={`font-mono font-bold ${c}`}>{value}</span>
    </div>
  );
}
function CliSep() {
  return <div className="text-[11px] text-zinc-800 font-mono py-0.5">{sep}</div>;
}

export default function PayrollRunPage() {
  const { companyId, tahun, bulan } = useParams();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [existingRun, setExistingRun] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch Employees
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .eq('aktif', true);
      
      // Fetch Events for this period
      const { data: eventData } = await supabase
        .from('employee_events')
        .select('*')
        .eq('company_id', companyId)
        .eq('tahun', tahun)
        .eq('bulan', bulan);
      
      // Fetch Existing Run
      const { data: runData } = await supabase
        .from('payroll_runs')
        .select('*, payroll_results(*)')
        .eq('company_id', companyId)
        .eq('tahun', tahun)
        .eq('bulan', bulan)
        .maybeSingle();

      const [{ data: co }, { data: empData }, { data: eventData }, { data: runData }] = await Promise.all([
        supabase.from('companies').select('name').eq('id', companyId).single(),
        supabase.from('employees').select('*').eq('company_id', companyId).eq('aktif', true),
        supabase.from('employee_events').select('*').eq('company_id', companyId).eq('tahun', tahun).eq('bulan', bulan),
        supabase.from('payroll_runs').select('*, payroll_results(*)').eq('company_id', companyId)
          .eq('tahun', tahun).eq('bulan', bulan).maybeSingle(),
      ]);
      if (co) setCompany(co);
      if (empData) setEmployees(empData);
      if (eventData) setEvents(eventData);
      if (runData) {
        setExistingRun(runData);
        if (runData.payroll_results) {
           const mapped = runData.payroll_results.map((r: any) => ({
              ...r.result_json,
              employee_id: r.employee_id,
              employee_name: empData?.find(e => e.id === r.employee_id)?.nama
           }));
           setResults(mapped);
           setIsCalculated(true);
        if (runData.payroll_results?.length > 0) {
          const mapped = runData.payroll_results.map((r: any) => ({
            ...r.result_json,
            employee_id: r.employee_id,
            employee_name: empData?.find(e => e.id === r.employee_id)?.nama,
            _db: r,
          }));
          setResults(mapped);
          setIsCalculated(true);
        }
      }
      setLoading(false);
@@ -80,304 +69,223 @@ export default function PayrollRunPage() {
  function handleCalculate() {
    const newResults = employees.map(emp => {
      const empEvents = events.filter(e => e.employee_id === emp.id);
      
      // Summarize events
      const kasbon = empEvents.filter(e => e.tipe === 'kasbon').reduce((a, b) => a + b.nilai, 0);
      const alpha_telat = empEvents.filter(e => e.tipe === 'alpha_telat').reduce((a, b) => a + b.nilai, 0);
      const pot_lain = empEvents.filter(e => e.tipe === 'pot_lain').reduce((a, b) => a + b.nilai, 0);
      const thr = empEvents.filter(e => e.tipe === 'thr').reduce((a, b) => a + b.nilai, 0);
      const bonus = empEvents.filter(e => e.tipe === 'bonus').reduce((a, b) => a + b.nilai, 0);
      const benefit_extra = empEvents.filter(e => e.tipe === 'benefit_extra').reduce((a, b) => a + b.nilai, 0);
      const kasbon = empEvents.filter(e => e.tipe === 'kasbon').reduce((a: number, b: any) => a + b.nilai, 0);
      const alpha_telat = empEvents.filter(e => e.tipe === 'alpha_telat').reduce((a: number, b: any) => a + b.nilai, 0);
      const pot_lain = empEvents.filter(e => e.tipe === 'pot_lain').reduce((a: number, b: any) => a + b.nilai, 0);
      const thr = empEvents.filter(e => e.tipe === 'thr').reduce((a: number, b: any) => a + b.nilai, 0);
      const bonus = empEvents.filter(e => e.tipe === 'bonus').reduce((a: number, b: any) => a + b.nilai, 0);
      const benefit_extra = empEvents.filter(e => e.tipe === 'benefit_extra').reduce((a: number, b: any) => a + b.nilai, 0);

      let calcResult: any = {};

      if (emp.jenis_karyawan === 'tetap') {
         calcResult = calculateMonthlySalary({
            ...emp,
            bulan: Number(bulan),
            tahun: Number(tahun),
            kasbon,
            alpha_telat,
            pot_lain: pot_lain + (emp.pot_lain || 0),
            tunj_lain: emp.tunj_lain + benefit_extra,
            thr,
            bonus,
            pph_jan_nov: 0, // Should fetch from previous runs if Dec
            akum_bruto: 0  // Should fetch from previous runs if Dec
         });
        calcResult = calculateMonthlySalary({
          ...emp, bulan: Number(bulan), tahun: Number(tahun),
          kasbon, alpha_telat, pot_lain: pot_lain + (emp.pot_lain || 0),
          tunj_lain: emp.tunj_lain + benefit_extra, thr, bonus,
          pph_jan_nov: 0, akum_bruto: 0,
        });
      } else {
         calcResult = calculateFreelance({
            ...emp,
            mode: emp.jenis_karyawan === 'tidak_tetap_harian' ? 'harian' : 'bulanan',
            upah_harian: emp.upah_harian,
            hari_kerja: emp.hari_kerja_default || 22,
            upah_bulanan: emp.upah_bulanan_tt,
            tunjangan: emp.tunjangan_tt + benefit_extra,
            thr,
            bonus,
            ikut_bpjs_tk: emp.ikut_jht || emp.ikut_jp,
            ikut_kes: emp.ikut_kes,
            kasbon,
            pot_lain: pot_lain + (emp.pot_lain || 0)
         });
        calcResult = calculateFreelance({
          ...emp,
          mode: emp.jenis_karyawan === 'tidak_tetap_harian' ? 'harian' : 'bulanan',
          upah_harian: emp.upah_harian, hari_kerja: emp.hari_kerja_default || 22,
          upah_bulanan: emp.upah_bulanan_tt,
          tunjangan: (emp.tunjangan_tt || 0) + benefit_extra,
          thr, bonus,
          ikut_bpjs_tk: emp.ikut_jht || emp.ikut_jp,
          ikut_kes: emp.ikut_kes, kasbon, pot_lain: pot_lain + (emp.pot_lain || 0),
        });
      }

      return {
         ...calcResult,
         employee_id: emp.id,
         employee_name: emp.nama
      };
      return { ...calcResult, employee_id: emp.id, employee_name: emp.nama };
    });

    setResults(newResults);
    setIsCalculated(true);
  }

  async function handleSave() {
    setSaving(true);
    const res = await savePayrollRun(
      companyId as string, 
      Number(tahun), 
      Number(bulan), 
      results
    );
    const res = await savePayrollRun(companyId as string, Number(tahun), Number(bulan), results);
    if (res.error) alert(res.error);
    else {
      setExistingRun({ ...existingRun, id: res.runId, status: 'calculated' });
    }
    else setExistingRun((p: any) => ({ ...p, id: res.runId, status: 'calculated' }));
    setSaving(false);
  }

  async function handleLock() {
    if (!existingRun?.id) return;
    if (!confirm('Kunci payroll? Data tidak akan bisa diubah lagi.')) return;
    if (!confirm('Kunci payroll? Data tidak bisa diubah lagi.')) return;
    setSaving(true);
    const res = await lockPayrollRun(existingRun.id, companyId as string, Number(tahun), Number(bulan));
    if (res.error) alert(res.error);
    else {
       setExistingRun({ ...existingRun, status: 'locked' });
    }
    else setExistingRun((p: any) => ({ ...p, status: 'locked' }));
    setSaving(false);
  }

  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (loading) return <div className="p-12 h-96 bg-gray-50 animate-pulse rounded-3xl" />;
  if (loading) return <div className="h-64 bg-[#111113] border border-[#1A1A1C] rounded-lg animate-pulse" />;

  const isLocked = existingRun?.status === 'locked';
  const totalBruto = results.reduce((a, r) => a + (r.bruto || r.total_upah || 0), 0);
  const totalPph = results.reduce((a, r) => a + (r.pph || r.total_pph || 0), 0);
  const totalThp = results.reduce((a, r) => a + (r.thp || 0), 0);
  const totalCtc = results.reduce((a, r) => a + (r.bruto || r.total_upah || 0) + (r.bpjs?.employer_offslip || 0), 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <Link 
             href={`/companies/${companyId}/payroll`}
             className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:text-sky-600 transition-all shadow-sm"
           >
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payroll: {bulanNames[Number(bulan) - 1]} {tahun}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-gray-500 text-xs font-medium">Perusahaan: <span className="text-gray-900 font-bold uppercase tracking-wider">{companyId}</span></span>
                 <span className="text-gray-300">•</span>
                 <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${
                   existingRun?.status === 'locked' ? 'bg-amber-100 text-amber-700' : 
                   existingRun?.status === 'calculated' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                 }`}>
                   {existingRun?.status || 'Draft'}
                 </span>
              </div>
           </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/companies/${companyId}/payroll`}
            className="w-9 h-9 bg-[#111113] border border-[#1A1A1C] rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 transition-colors">
            <ArrowLeft size={15} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              {BULAN_NAMES[Number(bulan) - 1]} {tahun}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-zinc-600">{company?.name ?? '—'}</p>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                existingRun?.status === 'locked' ? 'bg-green-900/25 text-green-400' :
                existingRun?.status === 'calculated' ? 'bg-sky-900/25 text-sky-400' :
                'bg-zinc-800 text-zinc-600'
              }`}>{existingRun?.status ?? 'draft'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {!isLocked && (
             <button 
               onClick={handleCalculate}
               className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-sky-200 text-sky-700 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-sky-50 transition-all shadow-sm"
             >
               <Calculator className="w-4 h-4" />
               Hitung Ulang
             </button>
           )}
           {isCalculated && !isLocked && (
             <button 
               onClick={handleSave}
               disabled={saving}
               className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 disabled:opacity-50"
             >
               <Save className="w-4 h-4" />
               {saving ? 'Menyimpan...' : 'Simpan Hasil'}
             </button>
           )}
           {existingRun?.status === 'calculated' && (
             <button 
               onClick={handleLock}
               disabled={saving}
               className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50"
             >
               <Lock className="w-4 h-4" />
               Kunci Data
             </button>
           )}
        <div className="flex gap-2">
          {!isLocked && (
            <button onClick={handleCalculate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#111113] border border-[#1A1A1C] text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">
              <Calculator size={13} />
              {isCalculated ? 'Hitung Ulang' : 'Hitung'}
            </button>
          )}
          {isCalculated && !isLocked && (
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0A0A0B] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#c9a32e] disabled:opacity-50 transition-colors">
              <Save size={13} />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          )}
          {existingRun?.status === 'calculated' && (
            <button onClick={handleLock} disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#111113] border border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 transition-colors">
              <Lock size={13} />
              Kunci
            </button>
          )}
        </div>
      </div>

      {/* Summary Row */}
      {/* Summary */}
      {isCalculated && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Gross (Bruto)</span>
              <span className="text-xl font-black text-gray-900 font-mono italic">{formatRupiah(results.reduce((a, b) => a + (b.bruto || (b.total_upah || 0)), 0))}</span>
           </div>
           <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total PPh 21</span>
              <span className="text-xl font-black text-rose-600 font-mono italic">{formatRupiah(results.reduce((a, b) => a + (b.pph || b.total_pph || 0), 0))}</span>
           </div>
           <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Net Pay (THP)</span>
              <span className="text-xl font-black text-emerald-600 font-mono italic">{formatRupiah(results.reduce((a, b) => a + (b.thp || 0), 0))}</span>
           </div>
           <div className="bg-sky-900 p-6 rounded-3xl shadow-lg border border-sky-800">
              <span className="block text-[10px] font-bold text-sky-300 uppercase tracking-widest mb-2">Cost To Company</span>
              <span className="text-xl font-black text-white font-mono italic">{formatRupiah(results.reduce((a, b) => a + (b.bruto || b.total_upah || 0) + (b.bpjs?.employer_offslip || 0), 0))}</span>
           </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Bruto', value: formatRupiah(totalBruto), color: 'text-zinc-100' },
            { label: 'Total PPh 21', value: formatRupiah(totalPph), color: 'text-amber-400' },
            { label: 'Total THP', value: formatRupiah(totalThp), color: 'text-green-400' },
            { label: 'Total CTC', value: formatRupiah(totalCtc), color: 'text-sky-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#111113] border border-[#1A1A1C] rounded-lg p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">{s.label}</p>
              <p className={`text-sm font-bold font-mono ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden pb-12">
         {!isCalculated ? (
           <div className="p-32 text-center flex flex-col items-center">
              <Calculator className="w-16 h-16 text-gray-100 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Dihitung</h3>
              <p className="text-sm text-gray-400 mb-8 max-w-xs mx-auto">Klik tombol hitung di atas untuk memproses gaji {employees.length} karyawan aktif.</p>
              <button 
                onClick={handleCalculate}
                className="px-12 py-4 bg-sky-600 text-white rounded-2xl font-bold shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all uppercase tracking-widest text-xs"
              >
                Mulai Kalkulasi Sekarang
              </button>
           </div>
         ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                       <th className="px-8 py-5">Nama Karyawan</th>
                       <th className="px-8 py-5">Bruto</th>
                       <th className="px-8 py-5">PPh 21</th>
                       <th className="px-8 py-5">BPJS (K)</th>
                       <th className="px-8 py-5 font-bold text-gray-900">Net Take Home Pay</th>
                       <th className="px-8 py-5">Status</th>
                       <th className="px-8 py-5 text-right">Aksi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {results.map((res, i) => (
                       <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400 text-xs">
                                   {res.employee_name?.charAt(0)}
                                </div>
                                <div>
                                   <div className="text-sm font-bold text-gray-900">{res.employee_name}</div>
                                   <div className="text-[10px] text-gray-400 uppercase tracking-tighter font-medium">{res.mode === 'harian' ? 'Harian' : (res.mode === 'bulanan' ? 'Bulanan TT' : 'Tetap')}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-sm font-bold text-gray-700 font-mono tracking-tighter">{formatRupiah(res.bruto || res.total_upah)}</span>
                             {(res.thr_nominal > 0 || res.bonus_nominal > 0) && (
                               <div className="text-[10px] text-amber-600 font-bold mt-0.5">Incl. THR/Bonus</div>
                             )}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-rose-600 font-mono">{formatRupiah(res.pph || res.total_pph)}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black ${res.pph_ditanggung ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                                   {res.pph_ditanggung ? 'TAX-B' : 'TAX-D'}
                                </span>
                             </div>
                             {res.ter && <div className="text-[9px] text-gray-400 mt-1 uppercase tracking-widest font-bold">TER: {(res.ter * 100).toFixed(2)}%</div>}
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-sm font-bold text-gray-500 font-mono">{formatRupiah(res.bpjs?.karyawan_potong || res.tot_bpjs || 0)}</span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="text-lg font-black text-gray-900 font-mono italic tracking-tighter">{formatRupiah(res.thp)}</div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Valid</span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button className="p-2.5 bg-gray-50 rounded-xl hover:bg-sky-50 hover:text-sky-600 text-gray-400 transition-all">
                                <FileText className="w-4 h-4" />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}
      </div>
      {/* CLI Results */}
      {!isCalculated ? (
        <div className="bg-[#111113] border border-[#1A1A1C] rounded-lg p-16 text-center">
          <Calculator size={32} className="mx-auto text-zinc-700 mb-4" />
          <p className="text-sm text-zinc-500 mb-2">Belum dihitung</p>
          <p className="text-xs text-zinc-700 mb-6">{employees.length} karyawan aktif siap diproses</p>
          <button onClick={handleCalculate}
            className="px-8 py-3 bg-[#D4AF37] text-[#0A0A0B] rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#c9a32e] transition-colors">
            Mulai Kalkulasi
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((res, i) => {
            const isTetap = !res.mode || res.mode === undefined || res.mode === 'tetap';
            const bpjsK = res.bpjs?.karyawan_potong ?? res.tot_bpjs ?? 0;
            const bpjsEmp = res.bpjs?.employer_total ?? 0;
            const ctc = (res.bruto || res.total_upah || 0) + (res.bpjs?.employer_offslip ?? 0);
            return (
              <div key={i} className="bg-[#080809] border border-[#1A1A1C] rounded-lg overflow-hidden font-mono">
                {/* Employee header */}
                <div className="px-5 py-3 bg-[#0F0F11] border-b border-[#1A1A1C] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[#D4AF37] text-sm">$</span>
                    <span className="text-sm font-bold text-zinc-200 uppercase tracking-wide">{res.employee_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-zinc-600">{res.mode ? res.mode.toUpperCase() : 'TETAP'}</span>
                    <span className="text-zinc-800">·</span>
                    <span className="text-zinc-600">{res.status_ptkp ?? '—'}</span>
                    <span className="text-zinc-800">·</span>
                    <span className={res.punya_npwp !== false ? 'text-green-500' : 'text-red-500'}>
                      {res.punya_npwp !== false ? 'NPWP ✓' : 'NO NPWP +20%'}
                    </span>
                    {res.pph_ditanggung && <>
                      <span className="text-zinc-800">·</span>
                      <span className="text-amber-400">GROSSUP</span>
                    </>}
                  </div>
                </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
         <div className="bg-sky-50 border border-sky-100 rounded-3xl p-8 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-600 shadow-sm shrink-0">
               <Info className="w-5 h-5" />
            </div>
            <div>
               <h4 className="font-bold text-sky-900 mb-2">Informasi Perpajakan</h4>
               <p className="text-xs text-sky-800 leading-relaxed font-medium">
                  Kalkulasi ini menggunakan standar <strong>TER (Tarif Efektif Rata-rata)</strong> PP 58/2023 untuk Januari-November. 
                  Untuk bulan Desember, sistem akan otomatis melakukan <strong>Equalisasi Pasal 17</strong> (Annual tax calculation).
               </p>
            </div>
         </div>
         <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
               <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
               <h4 className="font-bold text-emerald-900 mb-2">Keamanan & Audit</h4>
               <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  Pastikan data <strong>NIK & NPWP</strong> karyawan sudah benar. Kesalahan NPWP akan menyebabkan kenaikan tarif PPh sebesar <strong>+20%</strong> secara otomatis oleh engine.
               </p>
            </div>
         </div>
      </div>
                <div className="px-5 py-4 space-y-0">
                  {isTetap ? (
                    <>
                      <CliRow label="gaji_pokok" value={formatRupiah(res.gaji_pokok ?? 0)} />
                      {(res.allowance_total ?? 0) > 0 && <CliRow label="tunjangan_total" value={formatRupiah(res.allowance_total)} />}
                      <CliSep />
                      <CliRow label="bruto" value={formatRupiah(res.bruto ?? 0)} color="text-zinc-100" />
                      <CliRow label="ter_rate" value={res.ter != null ? `${(res.ter * 100).toFixed(2)}%` : 'Pasal 17 ✓'} />
                      <CliRow label="pph21" value={formatRupiah(res.pph ?? 0)} color="text-amber-400" />
                      {res.pph_ditanggung && <CliRow label="tunj_pph (co.)" value={formatRupiah(res.tunj_pph ?? 0)} color="text-amber-300" />}
                      {bpjsK > 0 && <>
                        <CliSep />
                        <CliRow label="bpjs_karyawan" value={formatRupiah(bpjsK)} color="text-zinc-500" />
                        {bpjsEmp > 0 && <CliRow label="bpjs_employer" value={formatRupiah(bpjsEmp)} color="text-zinc-700" />}
                      </>}
                      {(res.thr_nominal > 0 || res.bonus_nominal > 0) && <>
                        <CliSep />
                        {res.thr_nominal > 0 && (
                          <div className="text-[11px] py-0.5">
                            <span className="text-zinc-600">{'thr'.padEnd(22,' ')}</span>
                            <span className="text-amber-400">nominal {formatRupiah(res.thr_nominal)}</span>
                            <span className="text-zinc-700"> · pph {formatRupiah(res.thr_pph ?? 0)}</span>
                            <span className="text-green-400"> · net {formatRupiah(res.thr_thp ?? 0)}</span>
                          </div>
                        )}
                        {res.bonus_nominal > 0 && (
                          <div className="text-[11px] py-0.5">
                            <span className="text-zinc-600">{'bonus'.padEnd(22,' ')}</span>
                            <span className="text-amber-400">nominal {formatRupiah(res.bonus_nominal)}</span>
                            <span className="text-zinc-700"> · pph {formatRupiah(res.bonus_pph ?? 0)}</span>
                            <span className="text-green-400"> · net {formatRupiah(res.bonus_thp ?? 0)}</span>
                          </div>
                        )}
                      </>}
                    </>
                  ) : (
                    <>
                      <CliRow label="total_upah" value={formatRupiah(res.total_upah ?? 0)} color="text-zinc-100" />
                      <CliRow label="pph21" value={formatRupiah(res.total_pph ?? 0)} color="text-amber-400" />
                      {bpjsK > 0 && <CliRow label="bpjs_karyawan" value={formatRupiah(bpjsK)} color="text-zinc-500" />}
                    </>
                  )}
                  <CliSep />
                  <CliRow label="THP" value={formatRupiah(res.thp ?? 0)} color="text-green-400" />
                  <CliRow label="CTC" value={formatRupiah(ctc)} color="text-sky-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
