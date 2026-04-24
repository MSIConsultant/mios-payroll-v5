import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NewEmployeePage() {
  
  async function createEmployee(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    const data = {
      user_id: user.id,
      nama: formData.get('nama') as string,
      nik: formData.get('nik') as string,
      npwp: formData.get('npwp') as string,
      divisi: formData.get('divisi') as string,
      jenis_kelamin: formData.get('jenis_kelamin') as string,
      status_ptkp: formData.get('status_ptkp') as string,
      punya_npwp: formData.get('punya_npwp') === 'true',
      gaji_pokok: parseFloat((formData.get('gaji_pokok') as string) || '0'),
      benefit: parseFloat((formData.get('benefit') as string) || '0'),
      kendaraan: parseFloat((formData.get('kendaraan') as string) || '0'),
      pulsa: parseFloat((formData.get('pulsa') as string) || '0'),
      operasional: parseFloat((formData.get('operasional') as string) || '0'),
      tunj_lain: parseFloat((formData.get('tunj_lain') as string) || '0'),
      ikut_jht: formData.get('ikut_jht') === 'true',
      ikut_jp: formData.get('ikut_jp') === 'true',
      ikut_jkp: formData.get('ikut_jkp') === 'true',
      jkk_rate: parseFloat((formData.get('jkk_rate') as string) || '0.0024'),
      tanggung_jht_k: formData.get('tanggung_jht_k') === 'true',
      tanggung_jp_k: formData.get('tanggung_jp_k') === 'true',
      ikut_kes: formData.get('ikut_kes') === 'true',
      tanggung_kes_k: formData.get('tanggung_kes_k') === 'true',
      pph_ditanggung: formData.get('pph_ditanggung') === 'true',
    };

    const { error } = await supabase.from('employees').insert([data]);
    
    if (!error) {
      redirect('/employees');
    }
  }

  return (
    <div className="p-10 flex-1 flex flex-col max-w-4xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl font-serif italic text-[#D4AF37]">Add Employee</h1>
        <p className="text-xs text-zinc-500 font-mono mt-1">Sistem Penggajian & PPh 21 TER 2026</p>
      </div>

      <form action={createEmployee} className="space-y-8 bg-[#0A0A0B] p-10 border border-[#27272A] shadow-2xl">
        
        {/* Identitas */}
        <div>
          <h2 className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] font-serif italic mb-4 pb-2 border-b border-[#27272A]">Identitas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Nama Lengkap</label>
              <input name="nama" type="text" required className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">NIK</label>
              <input name="nik" type="text" required className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Divisi</label>
              <input name="divisi" type="text" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Jenis Kelamin</label>
              <select name="jenis_kelamin" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm">
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pajak */}
        <div>
          <h2 className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] font-serif italic mb-4 pb-2 border-b border-[#27272A]">Pajak (PPh 21)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">NPWP</label>
              <input name="npwp" type="text" placeholder="12.345.678.9-000.000" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Punya NPWP?</label>
              <select name="punya_npwp" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm">
                <option value="true">Ya</option>
                <option value="false">Tidak (Tarif +20%)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Status PTKP</label>
              <select name="status_ptkp" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm">
                <option value="TK0">TK/0</option>
                <option value="TK1">TK/1</option>
                <option value="TK2">TK/2</option>
                <option value="TK3">TK/3</option>
                <option value="K0">K/0</option>
                <option value="K1">K/1</option>
                <option value="K2">K/2</option>
                <option value="K3">K/3</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Penanggung PPh 21</label>
              <select name="pph_ditanggung" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm">
                <option value="true">Ditanggung Perusahaan (Grossup)</option>
                <option value="false">Dipotong Karyawan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pendapatan */}
        <div>
          <h2 className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] font-serif italic mb-4 pb-2 border-b border-[#27272A]">Gaji & Tunjangan Bulanan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Gaji Pokok (Rp)</label>
              <input name="gaji_pokok" type="number" defaultValue="0" required className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Tunj. Umum/Benefit (Rp)</label>
              <input name="benefit" type="number" defaultValue="0" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Tunj. Kendaraan (Rp)</label>
              <input name="kendaraan" type="number" defaultValue="0" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Tunj. Pulsa (Rp)</label>
              <input name="pulsa" type="number" defaultValue="0" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm" />
            </div>
          </div>
        </div>

        {/* BPJS */}
        <div>
          <h2 className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] font-serif italic mb-4 pb-2 border-b border-[#27272A]">BPJS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">JHT Karyawan 2%</label>
              <select name="tanggung_jht_k" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm">
                <option value="true">Ditanggung Perusahaan (Tunjangan)</option>
                <option value="false">Dipotong Karyawan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">JP Karyawan 1%</label>
              <select name="tanggung_jp_k" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm">
                <option value="true">Ditanggung Perusahaan (Tunjangan)</option>
                <option value="false">Dipotong Karyawan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Kes Karyawan 1%</label>
              <select name="tanggung_kes_k" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm">
                <option value="true">Ditanggung Perusahaan (Tunjangan)</option>
                <option value="false">Dipotong Karyawan</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Risiko JKK</label>
              <select name="jkk_rate" className="w-full px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm">
                <option value="0.0024">Sangat Rendah (0.24%)</option>
                <option value="0.0054">Rendah (0.54%)</option>
                <option value="0.0089">Sedang (0.89%)</option>
                <option value="0.0127">Tinggi (1.27%)</option>
                <option value="0.0174">Sangat Tinggi (1.74%)</option>
              </select>
            </div>
          </div>
          
          {/* Hidden flags to simplify form: assuming all are true for ikut unless disabled */}
          <input type="hidden" name="ikut_jht" value="true" />
          <input type="hidden" name="ikut_jp" value="true" />
          <input type="hidden" name="ikut_jkp" value="true" />
          <input type="hidden" name="ikut_kes" value="true" />
        </div>

        <div className="pt-8 flex justify-end gap-3 border-t border-[#27272A]">
          <button type="submit" className="bg-[#D4AF37] hover:bg-yellow-600 text-[#0A0A0B] text-sm font-bold uppercase tracking-widest py-3 px-8 transition-all">
            Save Employee
          </button>
        </div>
      </form>
    </div>
  );
}
