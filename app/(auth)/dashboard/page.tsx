import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Note: if the tables don't exist yet, we'll gracefully handle it.
  const { count: employeeCount, error } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true });

  const isSetupNeeded = error?.code === '42P01'; // PostgreSQL code for undefined_table

  return (
    <div className="flex-1 flex flex-col p-10">
      <div className="mb-10">
        <h1 className="text-2xl font-serif italic text-[#D4AF37]">Dashboard</h1>
        <p className="text-xs text-zinc-500 font-mono mt-1">Overview of your payroll operations</p>
      </div>

      {isSetupNeeded && (
        <div className="bg-[#18181B] border border-red-900/50 p-6 mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-red-500 mb-2">Database Setup Required</h2>
          <p className="mb-4 text-xs text-zinc-400 font-mono">
            The necessary database tables have not been created yet in your Supabase project. 
            You need to create the \`employees\` table to get started.
          </p>
          <div className="bg-[#0A0A0B] p-4 border border-[#27272A] font-mono text-xs overflow-x-auto text-[#E4E4E7]">
            <pre>
{`-- Run this in your Supabase SQL Editor:
create table public.companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.employees (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) not null,
  nama text not null,
  nik text not null,
  npwp text not null,
  divisi text,
  jenis_kelamin text default 'L',
  status_ptkp text default 'TK0',
  punya_npwp boolean default true,
  gaji_pokok numeric default 0,
  benefit numeric default 0,
  kendaraan numeric default 0,
  pulsa numeric default 0,
  operasional numeric default 0,
  tunj_lain numeric default 0,
  ikut_jht boolean default true,
  ikut_jp boolean default true,
  ikut_jkp boolean default true,
  jkk_rate numeric default 0.0024,
  tanggung_jht_k boolean default true,
  tanggung_jp_k boolean default true,
  ikut_kes boolean default true,
  tanggung_kes_k boolean default true,
  pph_ditanggung boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.payroll_runs (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references public.employees(id) on delete cascade,
  user_id uuid references auth.users(id) not null,
  month integer not null,
  year integer not null,
  gross_bruto numeric not null,
  pph21 numeric not null,
  thp numeric not null,
  breakdown_json jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.companies enable row level security;
alter table public.employees enable row level security;
alter table public.payroll_runs enable row level security;

create policy "Users can manage their own companies." on public.companies for all using (auth.uid() = user_id);
create policy "Users can manage their own employees." on public.employees for all using (auth.uid() = user_id);
create policy "Users can manage their own runs." on public.payroll_runs for all using (auth.uid() = user_id);
`}
            </pre>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="p-6 border border-[#27272A] bg-[#0E0E10] space-y-2">
          <h3 className="text-xs text-zinc-500 uppercase tracking-widest bg-transparent border-none p-0">Total Employees</h3>
          <p className="text-4xl font-light font-mono text-[#E4E4E7] m-0">{isSetupNeeded ? '-' : (employeeCount || 0)} <span className="text-xl text-zinc-600">Active</span></p>
        </div>
        <div className="p-6 border border-[#27272A] bg-[#0E0E10] space-y-2">
          <h3 className="text-xs text-zinc-500 uppercase tracking-widest bg-transparent border-none p-0">Last Payroll Run</h3>
          <p className="text-4xl font-light font-mono text-[#E4E4E7] m-0">- <span className="text-sm text-zinc-600 uppercase">Pending</span></p>
        </div>
      </div>
    </div>
  );
}
