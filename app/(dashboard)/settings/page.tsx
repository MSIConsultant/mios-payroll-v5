'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useWorkspace } from '@/hooks/useWorkspace';
import { archiveCompany, deleteCompany } from '@/lib/actions/companies';
import { Trash2, Archive, AlertTriangle, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const { workspace } = useWorkspace();
  const [companies, setCompanies]     = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [confirmId, setConfirmId]     = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    async function fetch() {
      if (!workspace) return;
      const supabase = createClient();
      const { data } = await supabase.from('companies').select('id, name, aktif')
        .eq('workspace_id', workspace.id).order('name');
      if (data) setCompanies(data);
      setLoading(false);
    }
    fetch();
  }, [workspace]);

  async function handleArchive(id: string, aktif: boolean) {
    setDeleting(id);
    const res = await archiveCompany(id, !aktif);
    if (res.error) alert(res.error);
    else setCompanies(c => c.map(x => x.id === id ? { ...x, aktif: !aktif } : x));
    setDeleting(null);
  }

  async function handleHardDelete(id: string) {
    const co = companies.find(c => c.id === id);
    if (confirmText !== co?.name) {
      alert('Nama perusahaan tidak cocok.');
      return;
    }
    setDeleting(id);
    const res = await deleteCompany(id);
    if (res.error) { alert(res.error); setDeleting(null); }
    else {
      setCompanies(c => c.filter(x => x.id !== id));
      setConfirmId(null);
      setConfirmText('');
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Pengaturan</h1>
        <p className="text-[11px] text-zinc-600 mt-0.5 font-mono">Workspace: {workspace?.name ?? '—'}</p>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#0F0A0A] border border-red-900/30 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-red-900/20 flex items-center gap-2">
          <AlertTriangle size={13} className="text-red-500" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Danger Zone — Manajemen Data</p>
        </div>

        <div className="p-5">
          <p className="text-xs text-zinc-500 mb-5 leading-relaxed font-mono">
            <span className="text-amber-400">PERINGATAN:</span> Hapus permanen akan menghapus semua data karyawan, variasi, dan riwayat payroll. Tindakan ini tidak dapat dibatalkan. Archive hanya menyembunyikan perusahaan dari tampilan utama.
          </p>

          {loading ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-14 bg-[#111113] rounded animate-pulse" />)}
            </div>
          ) : companies.length === 0 ? (
            <p className="text-xs text-zinc-700 font-mono">$ Belum ada perusahaan terdaftar.</p>
          ) : (
            <div className="space-y-2">
              {companies.map((co, i) => (
                <div key={co.id}
                  className="bg-[#111113] border border-[#1A1A1C] rounded-lg p-4 animate-fade-in-up font-mono"
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Building2 size={13} className="text-zinc-600" />
                      <span className="text-sm font-bold text-zinc-300">{co.name}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-widest font-bold ${
                        co.aktif ? 'bg-green-900/25 text-green-400' : 'bg-zinc-800 text-zinc-600'
                      }`}>{co.aktif ? 'aktif' : 'arsip'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleArchive(co.id, co.aktif)}
                        disabled={deleting === co.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D0F] border border-[#1A1A1C] text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 rounded text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                        <Archive size={11} />
                        {co.aktif ? 'Archive' : 'Restore'}
                      </button>
                      <button onClick={() => { setConfirmId(co.id); setConfirmText(''); }}
                        disabled={deleting === co.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0D0D0F] border border-red-900/40 text-red-500/60 hover:text-red-400 hover:border-red-800/60 rounded text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                        <Trash2 size={11} />
                        Hapus
                      </button>
                    </div>
                  </div>

                  {/* Confirm delete input */}
                  {confirmId === co.id && (
                    <div className="mt-3 pt-3 border-t border-red-900/20 animate-fade-in">
                      <p className="text-[10px] text-red-400 mb-2">
                        Ketik <span className="font-bold text-red-300">{co.name}</span> untuk konfirmasi hapus permanen:
                      </p>
                      <div className="flex gap-2">
                        <input value={confirmText} onChange={e => setConfirmText(e.target.value)}
                          placeholder={co.name}
                          className="flex-1 px-3 py-2 bg-[#0D0D0F] border border-red-900/30 rounded text-xs text-zinc-200 placeholder:text-zinc-800 outline-none focus:border-red-700/50 transition-colors font-mono" />
                        <button onClick={() => handleHardDelete(co.id)}
                          disabled={deleting === co.id || confirmText !== co.name}
                          className="px-4 py-2 bg-red-900/30 border border-red-800/40 text-red-400 hover:bg-red-900/50 rounded text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-30">
                          {deleting === co.id ? '...' : 'Konfirmasi'}
                        </button>
                        <button onClick={() => { setConfirmId(null); setConfirmText(''); }}
                          className="px-4 py-2 bg-[#0D0D0F] border border-[#1A1A1C] text-zinc-600 hover:text-zinc-400 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
