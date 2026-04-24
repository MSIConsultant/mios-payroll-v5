'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Employee, EmployeeEvent } from '@/lib/types';
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  Calendar, 
  Briefcase, 
  User, 
  Wallet,
  ShieldCheck,
  History,
  Plus,
  X
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { addEvent, deleteEvent, deleteEmployee } from '@/lib/actions/employees';

export default function EmployeeDetailPage() {
  const { companyId, empId } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [events, setEvents] = useState<EmployeeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profil');
  const [showEventModal, setShowEventModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: empData } = await supabase
        .from('employees')
        .select('*')
        .eq('id', empId)
        .single();
      
      const { data: eventData } = await supabase
        .from('employee_events')
        .select('*')
        .eq('employee_id', empId)
        .order('tahun', { ascending: false })
        .order('bulan', { ascending: false });
      
      if (empData) setEmployee(empData);
      if (eventData) setEvents(eventData);
      setLoading(false);
    }

    if (empId) fetchData();
  }, [empId]);

  async function handleDeleteEmployee() {
    if (!confirm('Apakah Anda yakin ingin menghapus data karyawan ini? Seluruh riwayat akan hilang.')) return;
    setIsDeleting(true);
    const res = await deleteEmployee(empId as string, companyId as string);
    if (res.error) {
       alert(res.error);
       setIsDeleting(false);
    } else {
       router.push(`/companies/${companyId}`);
    }
  }

  async function handleAddEvent(formData: FormData) {
    const res = await addEvent(formData);
    if (res.error) {
      alert(res.error);
    } else {
      setShowEventModal(false);
      // Refresh events
      const supabase = createClient();
      const { data: eventData } = await supabase
        .from('employee_events')
        .select('*')
        .eq('employee_id', empId)
        .order('tahun', { ascending: false })
        .order('bulan', { ascending: false });
      if (eventData) setEvents(eventData);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm('Hapus event ini?')) return;
    const res = await deleteEvent(id, companyId as string, empId as string);
    if (res.error) {
      alert(res.error);
    } else {
      setEvents(events.filter(e => e.id !== id));
    }
  }

  if (loading) return <div className="p-8 animate-pulse bg-gray-50 rounded-3xl h-96"></div>;
  if (!employee) return <div>Employee not found</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <Link 
             href={`/companies/${companyId}`}
             className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:text-sky-600 transition-all shadow-sm"
           >
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{employee.nama}</h1>
                 <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${employee.aktif ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {employee.aktif ? 'Aktif' : 'Non-Aktif'}
                 </span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">{employee.jabatan || 'No Title'} • {employee.divisi || 'Tanpa Divisi'}</p>
           </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={handleDeleteEmployee}
             disabled={isDeleting}
             className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-red-100 text-red-500 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
           >
             <Trash2 className="w-4 h-4" />
             Hapus Data
           </button>
           <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all">
             <Edit2 className="w-4 h-4" />
             Edit Profil
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/50 rounded-2xl w-fit">
         {[
           { id: 'profil', label: 'Profil & Skema', icon: User },
           { id: 'events', label: 'Variasi (Events)', icon: Calendar },
           { id: 'riwayat', label: 'Riwayat Payroll', icon: History },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
               activeTab === tab.id ? 'bg-white text-sky-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
             }`}
           >
             <tab.icon className="w-4 h-4" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'profil' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                {/* Identity Card */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
                   <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
                      <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                         <User className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Identitas & Jabatan</h3>
                   </div>
                   <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                      <div>
                         <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">NIK (ID)</span>
                         <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">{employee.nik}</span>
                      </div>
                      <div>
                         <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">NPWP</span>
                         <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">{employee.npwp || 'Belum Terdaftar'}</span>
                      </div>
                      <div>
                         <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Status PTKP</span>
                         <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block uppercase tracking-wider">{employee.status_ptkp}</span>
                      </div>
                      <div>
                         <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Tanggal Masuk</span>
                         <span className="text-sm font-bold text-gray-900">{employee.tanggal_masuk ? new Date(employee.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                      </div>
                   </div>
                </div>

                {/* Compensation Card */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
                   <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-6">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                         <Wallet className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Kompensasi & Tunjangan</h3>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12">
                      <div>
                         <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Gaji Pokok</span>
                         <span className="text-lg font-bold text-gray-900 font-mono">{formatRupiah(employee.gaji_pokok)}</span>
                      </div>
                      {employee.benefit > 0 && (
                        <div>
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Tunj. Tetap</span>
                           <span className="text-sm font-bold text-gray-900 font-mono">{formatRupiah(employee.benefit)}</span>
                        </div>
                      )}
                      {employee.kendaraan > 0 && (
                        <div>
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Tunj. Kendaraan</span>
                           <span className="text-sm font-bold text-gray-900 font-mono">{formatRupiah(employee.kendaraan)}</span>
                        </div>
                      )}
                      {employee.pulsa > 0 && (
                        <div>
                           <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Pulsa</span>
                           <span className="text-sm font-bold text-gray-900 font-mono">{formatRupiah(employee.pulsa)}</span>
                        </div>
                      )}
                   </div>
                </div>
             </div>

             <div className="space-y-8">
                {/* PPh Scheme */}
                <div className="bg-sky-900 text-white rounded-3xl shadow-lg p-8 relative overflow-hidden">
                   <div className="relative z-10">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-300/80 mb-6">Skema PPh 21</h3>
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-sky-200" />
                         </div>
                         <div className="text-xl font-bold tracking-tight">{employee.pph_ditanggung ? 'Grossup' : 'Dipotong'}</div>
                      </div>
                      <p className="text-xs text-sky-200/70 leading-relaxed font-medium">
                         {employee.pph_ditanggung 
                           ? 'PPh 21 ditanggung perusahaan (masuk sebagai tunjangan pajak).' 
                           : 'PPh 21 dipotong langsung dari gaji bruto karyawan.'}
                      </p>
                   </div>
                   <div className="absolute -bottom-6 -right-6 text-white/5">
                      <ShieldCheck className="w-32 h-32" />
                   </div>
                </div>

                {/* BPJS Status */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-6">Status BPJS</h3>
                   <div className="space-y-4">
                      {[
                        { label: 'BPJS Ketenagakerjaan', active: employee.ikut_jht || employee.ikut_jp || employee.ikut_jkp },
                        { label: 'BPJS Kesehatan', active: employee.ikut_kes },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                           <span className="text-xs font-bold text-gray-700">{item.label}</span>
                           <span className={`w-3 h-3 rounded-full ${item.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-gray-200'}`}></span>
                        </div>
                      ))}
                      <div className="pt-4 mt-4 border-t border-gray-50">
                         <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">JKK Rate</span>
                         <span className="text-sm font-bold text-gray-900">{(employee.jkk_rate * 100).toFixed(2)}%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                   <h3 className="font-bold text-gray-900 tracking-tight">Variasi Pajak & Pendapatan</h3>
                   <p className="text-xs text-gray-500 mt-0.5 font-medium italic">THR, Bonus, Kasbon, Potongan Lateness, dll.</p>
                </div>
                <button 
                  onClick={() => setShowEventModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-sky-700 transition-all shadow-lg shadow-sky-200"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Variasi
                </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                     <tr className="bg-gray-50/50 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                        <th className="px-8 py-4">Periode</th>
                        <th className="px-8 py-4">Tipe Variasi</th>
                        <th className="px-8 py-4 text-right">Nilai (Rp)</th>
                        <th className="px-8 py-4">Keterangan</th>
                        <th className="px-8 py-4"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {events.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-gray-400 italic text-sm">Belum ada variasi bulan ini atau sebelumnya.</td>
                       </tr>
                     ) : (
                       events.map(event => (
                         <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-5">
                               <div className="text-sm font-bold text-gray-900">{['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][event.bulan - 1]} {event.tahun}</div>
                            </td>
                            <td className="px-8 py-5 text-xs">
                               <span className={`px-2 py-1 rounded-lg font-bold uppercase tracking-tighter ${
                                 ['thr','bonus'].includes(event.tipe) ? 'bg-amber-50 text-amber-600' : 
                                 ['alpha_telat','kasbon','pot_lain'].includes(event.tipe) ? 'bg-red-50 text-red-600' : 'bg-sky-50 text-sky-600'
                               }`}>
                                 {event.tipe.replace('_', ' ')}
                               </span>
                            </td>
                            <td className="px-8 py-5 text-right font-mono font-bold text-sm text-gray-900">
                               {formatRupiah(event.nilai)}
                            </td>
                            <td className="px-8 py-5 text-xs text-gray-500 font-medium">{event.keterangan || '-'}</td>
                            <td className="px-8 py-5 text-right">
                               <button 
                                 onClick={() => handleDeleteEvent(event.id)}
                                 className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </td>
                         </tr>
                       ))
                     )}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs">Tambah Variasi Bulanan</h4>
                 <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              <form action={handleAddEvent} className="p-8 space-y-6">
                 <input type="hidden" name="employee_id" value={empId} />
                 <input type="hidden" name="company_id" value={companyId} />
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tahun</label>
                      <input name="tahun" type="number" defaultValue={2026} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-bold text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Bulan</label>
                      <select name="bulan" defaultValue={1} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-bold text-sm">
                         {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>Bulan {m}</option>)}
                      </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tipe Variasi</label>
                    <select name="tipe" className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-bold text-xs uppercase tracking-widest">
                       <option value="thr">THR</option>
                       <option value="bonus">Bonus</option>
                       <option value="benefit_extra">Extra Benefit (Taxable)</option>
                       <option value="alpha_telat">Potongan Alpha/Telat</option>
                       <option value="kasbon">Pinjaman / Kasbon</option>
                       <option value="pot_lain">Potongan Lain-lain</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nilai (Nominal Rp)</label>
                    <input name="nilai" type="number" required placeholder="0" className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold text-lg" />
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Keterangan (Optional)</label>
                    <textarea name="keterangan" rows={2} className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium text-sm"></textarea>
                 </div>

                 <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-sky-100 uppercase tracking-[0.2em] text-xs">Simpan Variasi</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
