'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWorkspace } from '@/hooks/useWorkspace';
import { createClient } from '@/lib/supabase/client';
import { 
  BarChart3, 
  Building2, 
  Settings, 
  LogOut, 
  ChevronRight,
  User,
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { workspace, workspaces, switchWorkspace } = useWorkspace();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Perusahaan', href: '/companies', icon: Building2 },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-[240px] fixed inset-y-0 left-0 bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Top section: Logo & Workspace Switcher */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="font-bold text-gray-900 tracking-tight">MIOS Payroll</span>
        </div>

        {/* Workspace Switcher */}
        <div className="relative group">
          <button className="w-full h-12 px-3 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg hover:border-sky-300 transition-all text-left">
            <div className="flex items-center gap-2 overflow-hidden">
              <Layers className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {workspace?.name || 'Pilih Workspace'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:rotate-90 transition-transform" />
          </button>
          
          {/* Dropdown - simple implementation */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 group-focus-within:opacity-100 pointer-events-none group-focus-within:pointer-events-auto transition-all z-[60] overflow-hidden">
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ganti Workspace</div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => switchWorkspace(ws.id)}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center justify-between ${
                    workspace?.id === ws.id 
                      ? 'bg-sky-50 text-sky-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {workspace?.id === ws.id && <div className="w-1.5 h-1.5 bg-sky-600 rounded-full" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                isActive 
                  ? 'bg-sky-50 text-sky-700 font-medium border-l-2 border-sky-600 rounded-l-none -ml-3 pl-4' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section: User Info */}
      <div className="p-3 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all group"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
