'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCompany } from '@/lib/actions/companies';
import { useWorkspace } from '@/hooks/useWorkspace';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

function Field({ label, name, placeholder, required }: { label: string; name: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">{label}</label>
      <input name={name} type="text" required={required} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-[#0D0D0F] border border-[#1A1A1C] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-[#D4AF37]/40 transition-colors" />
    </div>
  );
}

export default function NewCompanyPage() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (!workspace) return;
    setLoading(true); setError(null);
    const result = await createCompany(formData);
    if (result.error) { setError(result.error); setLoading(false); }
    else router.push('/companies');
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/companies"
          className="w-9 h-9 bg-[#111113] border border-[#1A1A1C] rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 transition-colors">
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Tambah Perusahaan</h1>
          <p className="text-[11px] text-zinc-600 mt-0.5">Daftarkan klien baru</p>
        </div>
      </div>

      <div className="bg-[#111113] border border-[#1A1A1C] rounded-lg p-6">
        <form action={handleSubmit} className="space-y-5">
          {error && <div className="p-3 bg-red-900/20 border border-red-800/30 rounded text-xs text-red-400 font-mono">{error}</div>}
          <input type="hidden" name="workspace_id" value={workspace?.id ?? ''} />

          <Field label="Nama Perusahaan *" name="name" placeholder="PT Bangun Jaya Abadi" required />
          <div className="grid grid-cols-2 gap-4">
            <Field label="NPWP Perusahaan" name="npwp_perusahaan" placeholder="00.000.000.0-000.000" />
            <Field label="Industri" name="industri" placeholder="Manufaktur" />
            <Field label="Kota" name="kota" placeholder="Jakarta Selatan" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Alamat</label>
            <textarea name="alamat" rows={2} placeholder="Alamat lengkap kantor..."
              className="w-full px-3 py-2.5 bg-[#0D0D0F] border border-[#1A1A1C] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-[#D4AF37]/40 transition-colors resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href="/companies" className="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">Batal</Link>
            <button type="submit" disabled={loading || !workspace}
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0B] px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#c9a32e] disabled:opacity-50 transition-colors">
              <Save size={13} />
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
