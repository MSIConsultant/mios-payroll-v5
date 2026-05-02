'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Layers, Settings } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/batch',     label: 'Batch Run',  icon: Layers },
  { href: '/companies', label: 'Perusahaan', icon: Building2 },
  { href: '/settings',  label: 'Pengaturan', icon: Settings },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 px-3 pt-4 space-y-0.5">
      {NAV.map(({ href, label, icon: Icon }, i) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 animate-slide-left stagger-${i + 1} ${
              active
                ? 'bg-[#1A1A1C] text-[#D4AF37] border-l-2 border-[#D4AF37] pl-[10px]'
                : 'text-zinc-500 border-l-2 border-transparent hover:bg-[#111113] hover:text-zinc-300'
            }`}>
            <Icon size={15} className={active ? 'text-[#D4AF37]' : 'text-zinc-700'} />
            <span className="font-medium text-xs uppercase tracking-widest">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
