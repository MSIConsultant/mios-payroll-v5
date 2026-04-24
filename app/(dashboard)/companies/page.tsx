'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Company } from '@/lib/types';
import { Building2, Plus, Search, MapPin, Users, Calendar } from 'lucide-react';

export default function CompaniesPage() {
  const { workspace, loading: wsLoading } = useWorkspace();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchCompanies() {
      if (!workspace) return;
      
      const supabase = createClient();
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('aktif', true)
        .order('name');
      
      if (data) setCompanies(data);
      setLoading(false);
    }

    if (!wsLoading) {
      if (workspace) {
        fetchCompanies();
      } else {
        setLoading(false);
      }
    }
  }, [workspace, wsLoading]);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.kota?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading || wsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-gray-50 border border-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar Perusahaan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data payroll untuk seluruh klien Anda dalam satu tempat.</p>
        </div>
        
        <Link 
          href="/companies/new"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm shadow-sky-100"
        >
          <Plus className="w-5 h-5" />
          Tambah Perusahaan
        </Link>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Cari nama perusahaan atau kota..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
        />
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Belum ada perusahaan</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2 text-sm leading-relaxed">
            Mulai dengan menambahkan perusahaan klien pertama Anda untuk mulai mengelola payroll.
          </p>
          <div className="mt-8">
            <Link 
              href="/companies/new"
              className="text-sky-600 hover:text-sky-700 font-bold text-sm underline underline-offset-4"
            >
              Tambah Perusahaan Sekarang
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <Link 
              key={company.id} 
              href={`/companies/${company.id}`}
              className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-sky-600 hover:shadow-xl hover:shadow-sky-500/5 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-8 h-8 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center">
                    <ChevronRight className="w-4 h-4" />
                 </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-sky-700 transition-colors">{company.name}</h3>
                  <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium truncate">{company.kota || 'Alamat tidak diset'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-auto border-t border-gray-50 pt-4">
                <div className="flex items-center gap-2">
                   <Users className="w-4 h-4 text-gray-400" />
                   <div className="text-xs">
                      <span className="block font-bold text-gray-900">Karyawan</span>
                      <span className="text-gray-500">Lihat Daftar</span>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Calendar className="w-4 h-4 text-gray-400" />
                   <div className="text-xs">
                      <span className="block font-bold text-gray-900">Payroll</span>
                      <span className="text-gray-500">Terakhir: -</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper icons
function ChevronRight(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
