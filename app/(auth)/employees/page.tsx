import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, User } from 'lucide-react';

export default async function EmployeesPage() {
  const supabase = await createClient();
  const { data: employees, error } = await supabase
    .from('employees')
    .select('id, nama, nik, divisi, status_ptkp, gaji_pokok')
    .order('created_at', { ascending: false });

  const hasError = !!error;

  return (
    <div className="p-10 flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-serif italic text-[#D4AF37]">Employees</h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">Manage your employee data and payroll parameters</p>
        </div>
        <Link 
          href="/employees/new" 
          className="px-6 py-2 bg-[#D4AF37] text-[#0A0A0B] text-sm font-bold uppercase tracking-widest hover:bg-yellow-600 transition-all flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Add Employee</span>
        </Link>
      </div>

      {hasError ? (
        <div className="bg-[#18181B] border border-red-900/50 p-6 mb-10 text-red-500 font-mono text-xs">
          <p>Error loading employees. Please ensure database tables are set up correctly.</p>
        </div>
      ) : (
        <div className="border border-[#27272A] bg-[#0A0A0B] flex-1">
          {(!employees || employees.length === 0) ? (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 border border-[#27272A] bg-[#0E0E10] flex items-center justify-center mb-4">
                <User size={20} className="text-zinc-600" />
              </div>
              <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#E4E4E7] mb-2">No Employee Records</h3>
              <p className="text-xs text-zinc-500 mb-6 font-mono">Start by adding your first employee to run payroll.</p>
              <Link 
                href="/employees/new" 
                className="px-4 py-2 border border-[#27272A] bg-[#0E0E10] text-zinc-300 hover:bg-[#18181B] transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                Create Record
              </Link>
            </div>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-5 p-4 border-b border-[#27272A] text-[10px] uppercase tracking-[0.2em] font-serif italic text-zinc-500">
                <span>Name</span>
                <span>NIK</span>
                <span>Division</span>
                <span>PTKP</span>
                <span className="text-right">Gaji Pokok</span>
              </div>
              <div className="divide-y divide-[#18181B]">
                {employees.map((emp) => (
                  <div key={emp.id} className="grid grid-cols-5 p-5 bg-[#0A0A0B] hover:bg-[#111113] transition-colors cursor-pointer items-center">
                    <span className="text-sm font-medium text-[#D4AF37]">{emp.nama}</span>
                    <span className="text-sm text-zinc-300 font-mono">{emp.nik}</span>
                    <span className="text-sm text-zinc-400">{emp.divisi || '-'}</span>
                    <span>
                      <span className="px-2 py-1 inline-flex text-[10px] leading-tight font-bold uppercase tracking-widest bg-[#18181B] border border-[#27272A] text-zinc-300">
                        {emp.status_ptkp}
                      </span>
                    </span>
                    <span className="text-right text-sm font-mono text-[#E4E4E7]">
                      Rp {(emp.gaji_pokok || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
