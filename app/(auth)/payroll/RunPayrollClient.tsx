'use client';

import { useState } from 'react';
import { calculateMonthlySalary, type KaryawanTetap } from '@/lib/payroll/engine';

export default function RunPayrollClient({ employees }: { employees: (KaryawanTetap & { id: string })[] }) {
  const [month, setMonth] = useState(1);
  const [results, setResults] = useState<any[]>([]);

  const formatRp = (num: number) => {
    return 'Rp ' + Math.abs(num).toLocaleString('id-ID');
  };

  const handleRun = () => {
    const calculated = employees.map(emp => {
      const empData = { ...emp, bulan: month };
      return calculateMonthlySalary(empData);
    });
    setResults(calculated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0A0A0B] p-8 border border-[#27272A] shadow-2xl flex items-end gap-6">
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Pilih Bulan</label>
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))}
            className="w-48 px-4 py-3 bg-[#0E0E10] border border-[#27272A] text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all font-mono text-sm"
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <option key={m} value={m}>Bulan {m}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleRun}
          className="bg-[#D4AF37] hover:bg-yellow-600 text-[#0A0A0B] px-8 py-3 text-sm font-bold uppercase tracking-widest transition-all h-[46px]"
        >
          Hitung Payroll
        </button>
      </div>

      {results.length > 0 && (
        <div className="bg-[#0A0A0B] border border-[#27272A] shadow-2xl">
          <div className="p-6 border-b border-[#27272A] flex items-center justify-between">
            <span className="text-[10px] text-[#D4AF37] uppercase tracking-[0.2em] font-serif italic">Hasil Simulasi Bulan {month}</span>
          </div>
          <div className="overflow-x-auto w-full">
            <div className="min-w-max">
              <div className="grid grid-cols-[200px_1fr_1fr_1fr_1fr_1fr] p-4 border-b border-[#27272A] text-[10px] uppercase tracking-[0.2em] font-serif italic text-zinc-500 bg-[#0A0A0B]">
                  <span className="text-left">Karyawan</span>
                  <span className="text-right">Bruto (Rp)</span>
                  <span className="text-right">Tarif TER</span>
                  <span className="text-right">PPh 21</span>
                  <span className="text-right">BPJS (Potong)</span>
                  <span className="text-right text-[#D4AF37]">THP</span>
              </div>
              <div className="divide-y divide-[#18181B]">
                {results.map((res, i) => {
                  const emp = employees[i];
                  const terLabel = res.ter !== null ? (res.ter * 100).toFixed(2) + '%' : 'Pasal 17';

                  return (
                    <div key={i} className="grid grid-cols-[200px_1fr_1fr_1fr_1fr_1fr] p-5 bg-[#0A0A0B] hover:bg-[#111113] transition-colors items-center">
                      <div>
                        <div className="text-sm font-medium text-[#D4AF37]">{emp.nama}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-1">{res.status_ptkp} • Grup {res.grup}</div>
                      </div>
                      <div className="text-right font-mono text-sm text-[#E4E4E7]">
                        {formatRp(res.bruto)}
                      </div>
                      <div className="text-right font-mono text-xs text-zinc-400">
                        {terLabel}
                      </div>
                      <div className="text-right text-sm font-mono">
                        <span className={res.pph_ditanggung ? "text-emerald-500" : "text-[#E4E4E7]"}>
                          {formatRp(res.pph)}
                        </span>
                        <div className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                          {res.pph_ditanggung ? '(Ditanggung)' : '(Dipotong)'}
                        </div>
                      </div>
                      <div className="text-right font-mono text-sm text-[#E4E4E7]">
                        {formatRp(res.bpjs.karyawan_potong)}
                      </div>
                      <div className="text-right font-mono text-base font-bold text-[#E4E4E7]">
                        {formatRp(res.thp)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
