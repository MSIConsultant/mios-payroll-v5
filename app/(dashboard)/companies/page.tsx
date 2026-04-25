'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Company } from '@/lib/types';
import { Building2, Plus, Search, MapPin, ArrowRight } from 'lucide-react';

export default function CompaniesPage() {
  const { workspace, loading: wsLoading } = useWorkspace();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchCompanies() {
      if (!workspace) { setLoading(false); return; }
      const supabase = createClient();
      const { data } = await supabase.from('companies').select('*')
        .eq('workspace_id', workspace.id).eq('aktif', true).order('name');
      if (data) setCompanies(data);
      setLoading(false);
    }
    if (!wsLoading) fetchCompanies();
  }, [workspace, wsLoading]);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.kota?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Perusahaan</h1>
          <p className="text-[11px] text-zinc-600 mt-0.5">Kelola klien dan payroll mereka</p>
        </div>
        <Link href="/companies/new"
          className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0A0A0B] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-[#c9a32e] transition-colors">
          <Plus size={13} />
          Tambah
        </Link>
      </div>

      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" />
        <input type="text" placeholder="Cari nama atau kota..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-[#111113] border border-[#1A1A1C] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-700 outline-none focus:border-[#D4AF37]/40 transition-colors" />
      </div>

      {(loading || wsLoading) ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-[#111113] border border-[#1A1A1C] rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#111113] border border-dashed border-[#1A1A1C] rounded-lg p-16 text-center">
          <Building2 size={28} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-600">Belum ada perusahaan</p>
          <Link href="/companies/new" className="mt-3 inline-block text-xs text-[#D4AF37] hover:underline">Tambah sekarang →</Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(co => (
            <Link key={co.id} href={`/companies/${co.id}`}
              className="flex items-center justify-between bg-[#111113] border border-[#1A1A1C] rounded-lg px-5 py-4 hover:border-[#D4AF37]/30 hover:bg-[#131315] transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-[#1A1A1C] rounded-lg flex items-center justify-center text-zinc-600 group-hover:text-[#D4AF37] transition-colors">
                  <Building2 size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100">{co.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={10} className="text-zinc-700" />
                    <p className="text-[10px] text-zinc-600">{co.kota ?? '—'}{co.industri ? ` · ${co.industri}` : ''}</p>
                  </div>
                </div>
              </div>
              <ArrowRight size={13} className="text-zinc-700 group-hover:text-[#D4AF37] transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
