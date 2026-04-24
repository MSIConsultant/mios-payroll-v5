'use client';

import { useState } from 'react';
import { createWorkspace } from '@/lib/actions/workspace';

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const result = await createWorkspace(formData);
    if (result && result.error) {
       setError(result.error);
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Selamat Datang!</h1>
          <p className="text-gray-600 mt-2">Buat Workspace Pertama Anda</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Workspace
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
              placeholder="Contoh: Kantor Akuntan MSI"
            />
            <p className="mt-2 text-xs text-gray-500">
              Workspace adalah ruang kerja kolaboratif untuk mengelola payroll klien.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Memproses...' : 'Mulai Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}
