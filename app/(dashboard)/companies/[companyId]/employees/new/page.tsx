'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createEmployee } from '@/lib/actions/employees';
import { User, Save, ArrowLeft, Wallet, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function NewEmployeePage() {
  const router = useRouter();
  const { companyId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jenisKaryawan, setJenisKaryawan] = useState('tetap');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createEmployee(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(`/companies/${companyId}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href={`/companies/${companyId}`}
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-sky-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Karyawan Baru</h1>
          <p className="text-gray-500 text-sm">Tambahkan Personel baru ke dalam sistem.</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-8 pb-20">
        <input type="hidden" name="company_id" value={companyId} />
        
        {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium font-mono">
              {error}
            </div>
        )}

        {/* Section 1: Identity */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-900">Identitas Diri</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nama Lengkap *</label>
                <input name="nama" type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium" />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">NIK *</label>
                <input name="nik" type="text" required className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium" />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Jenis Kelamin</label>
                <select name="jenis_kelamin" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium">
                   <option value="L">Laki-laki</option>
                   <option value="P">Perempuan</option>
                </select>
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">NPWP (Optional)</label>
                <input name="npwp" type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium" />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mempunyai NPWP?</label>
                <select name="punya_npwp" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium">
                   <option value="true">Ya (NPWP valid)</option>
                   <option value="false">Tidak (Potongan PPh +20%)</option>
                </select>
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status PTKP *</label>
                <select name="status_ptkp" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium">
                   {['TK0','TK1','TK2','TK3','K0','K1','K2','K3'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tanggal Masuk</label>
                <input name="tanggal_masuk" type="date" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium" />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Divisi</label>
                <input name="divisi" type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium" />
             </div>
             <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Jabatan</label>
                <input name="jabatan" type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium" />
             </div>
          </div>
        </div>

        {/* Section 2: Compensation */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
               <Wallet className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-gray-900">Kompensasi & Gaji</h3>
           </div>
           <div className="p-8 space-y-8">
              <div>
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tipe Karyawan *</label>
                 <div className="flex flex-wrap gap-3">
                    {['tetap', 'tidak_tetap_harian', 'tidak_tetap_bulanan'].map(t => (
                       <button 
                         key={t}
                         type="button" 
                         onClick={() => setJenisKaryawan(t)}
                         className={`px-6 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-widest transition-all ${
                            jenisKaryawan === t ? 'bg-sky-50 border-sky-600 text-sky-700' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                         }`}
                       >
                         {t.split('_').join(' ')}
                       </button>
                    ))}
                    <input type="hidden" name="jenis_karyawan" value={jenisKaryawan} />
                 </div>
              </div>

              {jenisKaryawan === 'tetap' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gaji Pokok *</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs uppercase tracking-widest pt-0.5">Rp</span>
                          <input name="gaji_pokok" type="number" defaultValue={0} required className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Benefit / Tunj. Tetap</label>
                       <input name="benefit" type="number" defaultValue={0} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tunj. Kendaraan</label>
                       <input name="kendaraan" type="number" defaultValue={0} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tunj. Pulsa</label>
                       <input name="pulsa" type="number" defaultValue={0} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tunj. Operasional</label>
                       <input name="operasional" type="number" defaultValue={0} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tunjangan Lain</label>
                       <input name="tunj_lain" type="number" defaultValue={0} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                </div>
              ) : jenisKaryawan === 'tidak_tetap_harian' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Upah Harian *</label>
                       <input name="upah_harian" type="number" defaultValue={0} required className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Hari Kerja Default</label>
                       <input name="hari_kerja_default" type="number" defaultValue={22} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Upah Borongan / Bulanan TT *</label>
                       <input name="upah_bulanan_tt" type="number" defaultValue={0} required className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                    <div>
                       <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tunjangan Borongan</label>
                       <input name="tunjangan_tt" type="number" defaultValue={0} className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-mono font-bold" />
                    </div>
                </div>
              )}
           </div>
        </div>

        {/* Section 3: BPJS & PPh */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
               <ShieldCheck className="w-5 h-5" />
             </div>
             <h3 className="font-bold text-gray-900">BPJS & PPh 21</h3>
           </div>
           <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                 <div className="space-y-4">
                    <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-6">Kepesertaan BPJS TK</h5>
                    <div className="space-y-4">
                       {['ikut_jht', 'ikut_jp', 'ikut_jkp'].map(f => (
                          <label key={f} className="flex items-center gap-3 cursor-pointer group">
                             <div className="relative">
                                <input type="checkbox" name={f} defaultChecked className="w-6 h-6 rounded-lg border-gray-200 text-sky-600 focus:ring-sky-500/20 transition-all cursor-pointer" />
                             </div>
                             <span className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-sky-600 transition-colors">{f.split('_').slice(1).join(' ').toUpperCase()}</span>
                          </label>
                       ))}
                       <div className="mt-6 pt-4 border-t border-gray-50">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tarif JKK Perusahaan</label>
                          <select name="jkk_rate" className="w-full px-3 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-lg outline-none transition-all text-xs font-bold">
                             <option value="0.0024">0.24% (Sangat Rendah)</option>
                             <option value="0.0054">0.54% (Rendah)</option>
                             <option value="0.0089">0.89% (Sedang)</option>
                             <option value="0.0127">1.27% (Tinggi)</option>
                             <option value="0.0174">1.74% (Sangat Tinggi)</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-6">Tunjangan Iuran Karyawan</h5>
                    <div className="space-y-4">
                       {['tanggung_jht_k', 'tanggung_jp_k', 'ikut_kes', 'tanggung_kes_k'].map(f => (
                          <label key={f} className="flex items-center gap-3 cursor-pointer group">
                             <input type="checkbox" name={f} defaultChecked className="w-6 h-6 rounded-lg border-gray-200 text-sky-600 focus:ring-sky-500/20 transition-all cursor-pointer" />
                             <span className="text-xs font-bold text-gray-600 uppercase tracking-widest group-hover:text-sky-600 transition-colors">
                                {f === 'ikut_kes' ? 'IKUT BPJS KESEHATAN' : `TUNJANGAN ${f.substring(9).replace('_k', '').toUpperCase()} KARYAWAN`}
                             </span>
                          </label>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em] mb-6">Skema PPh 21</h5>
                    <label className="flex flex-col gap-3 p-4 bg-sky-50 border border-sky-100 rounded-2xl cursor-pointer hover:bg-sky-100 transition-colors">
                       <div className="flex items-center gap-3">
                          <input type="checkbox" name="pph_ditanggung" defaultChecked className="w-6 h-6 rounded-lg border-gray-300 text-sky-700 focus:ring-sky-500/20 cursor-pointer" />
                          <span className="text-xs font-bold text-sky-900 uppercase tracking-widest">Grossup (Ditanggung)</span>
                       </div>
                       <p className="text-[10px] text-sky-700 leading-relaxed font-medium">
                          Perusahaan menanggung PPh 21. Nilai gaji yang diterima karyawan adalah nilai nominal di atas (THP = Gaji Pokok + Tunjangan).
                       </p>
                    </label>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex items-center justify-end gap-4">
           <Link href={`/companies/${companyId}`} className="px-8 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Batal</Link>
           <button
             type="submit"
             disabled={loading}
             className="px-12 py-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-sky-100 disabled:opacity-50 min-w-[200px]"
           >
             {loading ? 'Menyimpan...' : (
               <div className="flex items-center justify-center gap-2">
                 <Save className="w-5 h-5" />
                 Simpan Karyawan
               </div>
             )}
           </button>
        </div>
      </form>
    </div>
  );
}
