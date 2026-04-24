'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Company, Employee } from '@/lib/types';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft,
  Mail,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  FileText,
  Upload,
  Calendar
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { useRouter } from 'next/navigation';

export default function CompanyDetailPage() {
  const { companyId } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [lastRun, setLastRun] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: coData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
      
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .eq('aktif', true)
        .order('nama');

      const { data: runData } = await supabase
        .from('payroll_runs')
        .select('*')
        .eq('company_id', companyId)
        .order('tahun', { ascending: false })
        .order('bulan', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (coData) setCompany(coData);
      if (empData) setEmployees(empData);
      if (runData) setLastRun(runData);
      setLoading(false);
    }

    if (companyId) fetchData();
  }, [companyId]);

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.nama.toLowerCase().includes(search.toLowerCase()) || e.nik.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || e.jenis_karyawan === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
     return <div className="animate-pulse space-y-8">
        <div className="h-20 bg-gray-100 rounded-2xl"></div>
        <div className="h-64 bg-gray-50 rounded-2xl"></div>
     </div>;
  }

  if (!company) return <div>Company not found</div>;

  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/companies"
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-sky-600 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{company.name}</h1>
               <span className="bg-sky-50 text-sky-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-sky-100">Aktif</span>
            </div>
            <p className="text-gray-500 text-sm mt-0.5">{company.industri || 'Bidang Industri'} • {company.kota || 'Lokasi tidak diset'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/companies/${companyId}/payroll`}
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            <Calendar className="w-4 h-4" />
            Payroll Hub
          </Link>
          <Link 
            href={`/companies/${companyId}/employees/new`}
            className="inline-flex items-center gap-2 bg-sky-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200"
          >
            <Plus className="w-4 h-4" />
            Tambah Karyawan
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 text-sky-600 mb-4">
               <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Karyawan</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">{employees.length}</div>
            <div className="text-xs text-gray-500 mt-1">Personel terdaftar</div>
         </div>

         <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 text-emerald-600 mb-4">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Payroll Terakhir</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
               {lastRun ? `${bulanNames[lastRun.bulan - 1]} ${lastRun.tahun}` : '-'}
            </div>
            <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-black">
               {lastRun ? `Status: ${lastRun.status}` : 'Belum ada data'}
            </div>
         </div>

         <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 text-amber-600 mb-4">
               <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Total Gross</span>
            </div>
            <div className="text-lg font-bold text-gray-900 font-mono tracking-tight underline decoration-amber-200">
               {formatRupiah(employees.reduce((a, b) => a + (b.gaji_pokok || 0) + (b.benefit || 0), 0))}
            </div>
            <div className="text-xs text-gray-500 mt-1 italic font-medium">Estimasi pengeluaran bulanan</div>
         </div>
      </div>

      {/* Employee Table Section */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-gray-900">Personel Karyawan</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Cari nama atau NIK..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl text-sm outline-none transition-all w-64"
                />
             </div>
             
             <select 
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
               className="px-3 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl text-sm outline-none transition-all"
             >
                <option value="all">Semua Tipe</option>
                <option value="tetap">Karyawan Tetap</option>
                <option value="tidak_tetap_harian">Harian</option>
                <option value="tidak_tetap_bulanan">Borongan/Bulanan TT</option>
             </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                <th className="px-6 py-4">Nama / Identitas</th>
                <th className="px-6 py-4">Tipe / Divisi</th>
                <th className="px-6 py-4">PTKP / NPWP</th>
                <th className="px-6 py-4 text-right">Gaji Pokok</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic text-sm">
                    {search ? 'Tidak ada hasil pencarian' : 'Belum ada karyawan terdaftar'}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr 
                    key={emp.id} 
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/companies/${companyId}/employees/${emp.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                            {emp.nama.substring(0, 2)}
                         </div>
                         <div>
                            <div className="font-bold text-gray-900 group-hover:text-sky-700 transition-colors uppercase tracking-tight">{emp.nama}</div>
                            <div className="text-[10px] font-mono text-gray-400 mt-0.5">#{emp.nik}</div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                        <span className="font-black text-gray-400 uppercase tracking-widest block mb-1">{emp.jenis_karyawan === 'tetap' ? 'Tetap' : 'Tidak Tetap'}</span>
                        <div className="text-gray-900 font-bold">{emp.divisi || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{emp.status_ptkp}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${emp.punya_npwp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {emp.punya_npwp ? 'NPWP ✓' : 'NO NPWP'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="font-mono text-sm font-bold text-gray-900">{formatRupiah(emp.gaji_pokok)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sky-400 transition-all inline-block" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
