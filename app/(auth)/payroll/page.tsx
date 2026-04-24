import { createClient } from '@/lib/supabase/server';
import RunPayrollClient from './RunPayrollClient';
import type { KaryawanTetap } from '@/lib/payroll/engine';

export default async function PayrollPage() {
  const supabase = await createClient();
  const { data: employees } = await supabase.from('employees').select('*');

  const mappedEmployees: (KaryawanTetap & { id: string })[] = (employees || []).map(emp => ({
    id: emp.id,
    nama: emp.nama,
    nik: emp.nik,
    npwp: emp.npwp,
    divisi: emp.divisi || '',
    jenis_kelamin: emp.jenis_kelamin || 'L',
    bulan: 1, 
    tahun: 2026,
    status_ptkp: emp.status_ptkp || 'TK0',
    punya_npwp: emp.punya_npwp ?? true,
    gaji_pokok: Number(emp.gaji_pokok || 0),
    benefit: Number(emp.benefit || 0),
    kendaraan: Number(emp.kendaraan || 0),
    pulsa: Number(emp.pulsa || 0),
    operasional: Number(emp.operasional || 0),
    tunj_lain: Number(emp.tunj_lain || 0),
    ikut_jht: emp.ikut_jht ?? true,
    ikut_jp: emp.ikut_jp ?? true,
    ikut_jkp: emp.ikut_jkp ?? true,
    jkk_rate: Number(emp.jkk_rate || 0.0024),
    tanggung_jht_k: emp.tanggung_jht_k ?? true,
    tanggung_jp_k: emp.tanggung_jp_k ?? true,
    ikut_kes: emp.ikut_kes ?? true,
    tanggung_kes_k: emp.tanggung_kes_k ?? true,
    pph_ditanggung: emp.pph_ditanggung ?? true,
    kasbon: 0,
    alpha_telat: 0,
    pot_lain: 0,
    pph_jan_nov: 0,
    akum_bruto: 0,
  }));

  return (
    <div className="p-10 flex-1 flex flex-col max-w-6xl mx-auto space-y-8 w-full">
      <div>
        <h1 className="text-2xl font-serif italic text-[#D4AF37]">Run Payroll</h1>
        <p className="text-xs text-zinc-500 font-mono mt-1">Hitung PPh 21 TER, BPJS, dan Take Home Pay (THP)</p>
      </div>

      <RunPayrollClient employees={mappedEmployees} />
    </div>
  );
}
