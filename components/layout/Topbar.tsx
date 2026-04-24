'use client';

import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Bell, Search } from 'lucide-react';

export default function Topbar() {
  const pathname = pathnameToTitle(usePathname());
  const { workspace } = useWorkspace();

  function pathnameToTitle(path: string) {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/companies')) return 'Perusahaan';
    if (path.startsWith('/settings')) return 'Pengaturan';
    return '';
  }

  return (
    <header className="h-16 fixed top-0 right-0 left-[240px] bg-white border-b border-gray-100 flex items-center justify-between px-8 z-40">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">{pathname}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Cari data..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-sky-500 rounded-lg text-sm outline-none transition-all w-64"
          />
        </div>

        <button className="relative p-2 text-gray-400 hover:text-sky-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-100"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-gray-900">{workspace?.name || 'Loading...'}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-1">Workspace Aktif</div>
          </div>
          <div className="w-9 h-9 bg-sky-100 text-sky-700 rounded-lg flex items-center justify-center font-bold text-sm shadow-inner">
            {workspace?.name?.charAt(0) || 'W'}
          </div>
        </div>
      </div>
    </header>
  );
}
