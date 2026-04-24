'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  History, 
  Plus, 
  Calendar, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  Lock
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';

export default function PayrollOverviewPage() {
  const { companyId } = useParams();
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selTahun, setSelTahun] = useState(new Date().getFullYear());
  const [selBulan, setSelBulan] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    async function fetchRuns() {
      const supabase = createClient();
      const { data } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', companyId)
        .order('tahun', { ascending: false })
        .order('bulan', { ascending: false });
      
      if (data) setRuns(data);
      setLoading(false);
    }
    fetchRuns();
  }, [companyId]);

  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href={`/companies/${companyId}`}
            className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-sky-600 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payroll Hub</h1>
            <p className="text-gray-500 text-sm">Manajemen penggajian bulanan perusahaan.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Run New Selector */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
                 <Plus className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Jalankan Payroll Baru</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-8">Pilih periode untuk mulai menghitung pajak & gaji karyawan.</p>
              
              <div className="space-y-4">
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Tahun</label>
                    <select 
                      value={selTahun} 
                      onChange={(e) => setSelTahun(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-bold"
                    >
                       {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Bulan</label>
                    <select 
                      value={selBulan}
                      onChange={(e) => setSelBulan(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-bold"
                    >
                       {bulanNames.map((n, i) => <option key={i} value={i+1}>{n}</option>)}
                    </select>
                 </div>
                 <Link 
                   href={`/companies/${companyId}/payroll/${selTahun}/${selBulan}`}
                   className="flex items-center justify-center gap-2 w-full py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-sky-100 mt-4 group"
                 >
                   Mulai Hitung
                   <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
              </div>
           </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <History className="w-4 h-4 text-gray-400" />
                 <h3 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Riwayat Payroll</h3>
              </div>
           </div>

           {loading ? (
             <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />)}
             </div>
           ) : runs.length === 0 ? (
             <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium italic">Belum ada riwayat payroll yang dijalankan.</p>
             </div>
           ) : (
             <div className="space-y-4">
                {runs.map(run => (
                   <Link 
                     key={run.id}
                     href={`/companies/${companyId}/payroll/${run.tahun}/${run.bulan}`}
                     className="block bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-md hover:border-sky-100 transition-all group"
                   >
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 bg-gray-50 rounded-2xl flex flex-col items-center justify-center group-hover:bg-sky-50 transition-colors">
                              <span className="text-[10px] font-bold text-gray-400 items-start leading-none mb-1">{run.tahun}</span>
                              <span className="text-sm font-black text-gray-900 leading-none">{run.bulan.toString().padStart(2, '0')}</span>
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-900">{bulanNames[run.bulan - 1]} {run.tahun}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                 <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                                    run.status === 'locked' ? 'text-amber-600' : 'text-emerald-600'
                                 }`}>
                                    {run.status === 'locked' ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                                    {run.status}
                                 </span>
                                 <span className="text-[10px] text-gray-300">•</span>
                                 <span className="text-[10px] text-gray-400 font-medium">Terakhir dihitung: {new Date(run.calculated_at).toLocaleDateString('id-ID')}</span>
                              </div>
                           </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-sky-400 transition-colors" />
                     </div>
                   </Link>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
