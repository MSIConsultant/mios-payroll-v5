'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCompany } from '@/lib/actions/companies';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (!workspace) return;
    
    setLoading(true);
    setError(null);
    
    const result = await createCompany(formData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/companies');
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href="/companies"
          className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-sky-600 hover:border-sky-300 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tambah Perusahaan</h1>
          <p className="text-gray-500 text-sm">Silakan isi data klien perusahaan Anda di bawah ini.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Informasi Dasar</h3>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-0.5">Lengkapi semua field wajib (*)</p>
            </div>
          </div>
        </div>

        <form action={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
              {error}
            </div>
          )}

          <input type="hidden" name="workspace_id" value={workspace?.id || ''} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nama Perusahaan <span className="text-red-500">*</span>
              </label>
              <input 
                name="name"
                type="text" 
                required
                placeholder="Contoh: PT Bangun Jaya Abadi"
                className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                NPWP Perusahaan
              </label>
              <input 
                name="npwp_perusahaan"
                type="text" 
                placeholder="00.000.000.0-000.000"
                className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Industri
              </label>
              <input 
                name="industri"
                type="text" 
                placeholder="Contoh: Manufaktur"
                className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Kota
              </label>
              <input 
                name="kota"
                type="text" 
                placeholder="Contoh: Jakarta Selatan"
                className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Alamat Kantor
              </label>
              <textarea 
                name="alamat"
                rows={3}
                placeholder="Alamat lengkap kantor..."
                className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl outline-none transition-all font-medium resize-none"
              ></textarea>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading || !workspace}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-sky-200 disabled:opacity-50"
            >
              {loading ? (
                <>Menyimpan...</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Perusahaan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
