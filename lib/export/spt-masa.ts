import { formatRupiah } from '@/lib/format';

const BULAN = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export function exportSPTMasa(
  results: any[],
  company: any,
  employees: any[],
  bulan: number,
  tahun: number
) {
  const empMap = Object.fromEntries(employees.map(e => [e.id, e]));
  const periode = `${String(bulan).padStart(2,'0')}/${tahun}`;

  // Header info
  const lines: string[] = [];
  lines.push(`REKAPITULASI PPh 21 MASA — FORM 1721-I`);
  lines.push(`Perusahaan,${company.name}`);
  lines.push(`NPWP Perusahaan,${company.npwp_perusahaan ?? '-'}`);
  lines.push(`Masa Pajak,${BULAN[bulan]} ${tahun}`);
  lines.push(`Tanggal Cetak,${new Date().toLocaleDateString('id-ID')}`);
  lines.push(``);

  // Column headers — aligned with 1721-I fields
  lines.push([
    'No',
    'NPWP Karyawan',
    'NIK',
    'Nama',
    'Status PTKP',
    'Kode Objek Pajak',
    'Penghasilan Bruto (Rp)',
    'PPh 21 Dipotong (Rp)',
    'Tunjangan PPh / Grossup (Rp)',
    'THP (Rp)',
    'Metode',
    'Non-NPWP',
    'Keterangan',
  ].join(','));

  let totalBruto = 0;
  let totalPph = 0;
  let totalTunjPph = 0;
  let totalThp = 0;

  results.forEach((r, i) => {
    const emp = empMap[r.employee_id] ?? {};
    const bruto = r.bruto ?? r.total_upah ?? 0;
    const pph = r.pph ?? r.total_pph ?? 0;
    const tunj_pph = r.tunj_pph ?? 0;
    const thp = r.thp ?? 0;
    const isTetap = !r.mode || r.mode === 'tetap';
    const kodeObjek = isTetap ? '21-100-01' : '21-100-03';
    const metode = r.ter != null ? `TER ${(r.ter * 100).toFixed(2)}%` : 'Pasal 17 Equalisasi';
    const nonNpwp = emp.punya_npwp === false ? 'Ya (+20%)' : 'Tidak';

    totalBruto += bruto;
    totalPph += pph;
    totalTunjPph += tunj_pph;
    totalThp += thp;

    const row = [
      i + 1,
      `"${emp.npwp ?? '-'}"`,
      `"${emp.nik ?? '-'}"`,
      `"${r.employee_name ?? '-'}"`,
      emp.status_ptkp ?? '-',
      kodeObjek,
      bruto,
      pph,
      tunj_pph,
      thp,
      metode,
      nonNpwp,
      isTetap ? 'Pegawai Tetap' : (r.mode === 'harian' ? 'Tidak Tetap Harian' : 'Tidak Tetap Bulanan'),
    ];
    lines.push(row.join(','));

    // Separate row for THR if exists
    if (r.thr_nominal > 0) {
      lines.push([
        `${i + 1}a`,
        `"${emp.npwp ?? '-'}"`,
        `"${emp.nik ?? '-'}"`,
        `"${r.employee_name ?? '-'}"`,
        emp.status_ptkp ?? '-',
        '21-100-04',
        r.thr_nominal,
        r.thr_pph ?? 0,
        0,
        r.thr_thp ?? 0,
        'Selisih Pasal 17',
        nonNpwp,
        'THR',
      ].join(','));
      totalBruto += r.thr_nominal;
      totalPph += r.thr_pph ?? 0;
      totalThp += r.thr_thp ?? 0;
    }

    // Separate row for Bonus if exists
    if (r.bonus_nominal > 0) {
      lines.push([
        `${i + 1}b`,
        `"${emp.npwp ?? '-'}"`,
        `"${emp.nik ?? '-'}"`,
        `"${r.employee_name ?? '-'}"`,
        emp.status_ptkp ?? '-',
        '21-100-04',
        r.bonus_nominal,
        r.bonus_pph ?? 0,
        0,
        r.bonus_thp ?? 0,
        'Selisih Pasal 17',
        nonNpwp,
        'Bonus',
      ].join(','));
      totalBruto += r.bonus_nominal;
      totalPph += r.bonus_pph ?? 0;
      totalThp += r.bonus_thp ?? 0;
    }
  });

  // Totals
  lines.push(``);
  lines.push([
    'TOTAL','','','','','',
    totalBruto, totalPph, totalTunjPph, totalThp, '', '', '',
  ].join(','));

  lines.push(``);
  lines.push(`Catatan:`);
  lines.push(`"Kode Objek Pajak 21-100-01 = Gaji/Upah Pegawai Tetap (Form 1721-I)"`);
  lines.push(`"Kode Objek Pajak 21-100-03 = Upah Pegawai Tidak Tetap"`);
  lines.push(`"Kode Objek Pajak 21-100-04 = THR/Bonus (Selisih Pasal 17)"`);
  lines.push(`"File ini adalah rekap referensi. Input ke e-SPT sesuai format DJP yang berlaku."`);
  lines.push(`"Metode TER berdasarkan PP 58/2023 dan PMK 168/2023."`);

  const csv = lines.join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SPT_Masa_PPh21_${company.name.replace(/\s+/g,'_')}_${BULAN[bulan]}_${tahun}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
