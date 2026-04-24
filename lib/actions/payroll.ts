'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function savePayrollRun(
  companyId: string, 
  tahun: number, 
  bulan: number, 
  results: any[],
  status: 'draft' | 'calculated' | 'locked' = 'calculated'
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Ensure/Get Payroll Run ID
  const { data: run, error: runError } = await supabase
    .from('payroll_runs')
    .upsert({
      company_id: companyId,
      tahun,
      bulan,
      status,
      run_by: user?.id,
      calculated_at: new Date().toISOString(),
      ...(status === 'locked' ? { locked_at: new Date().toISOString() } : {})
    }, { onConflict: 'company_id, tahun, bulan' })
    .select()
    .single();

  if (runError) {
    console.error('Error saving payroll run:', runError);
    return { error: runError.message };
  }

  // 2. Prepare Results
  const resultsToInsert = results.map(r => ({
    run_id: run.id,
    employee_id: r.employee_id,
    company_id: companyId,
    gaji_pokok: r.gaji_pokok,
    allowance_total: r.allowance_total,
    bruto: r.bruto,
    ter_rate: r.ter,
    pph: r.pph,
    tunj_pph: r.tunj_pph,
    bpjs_employer: r.bpjs?.employer_total || 0,
    bpjs_karyawan: r.bpjs?.karyawan_potong || 0,
    thp: r.thp,
    ctc: r.bruto + (r.bpjs?.employer_offslip || 0),
    thr_nominal: r.thr_nominal || 0,
    thr_pph: r.thr_pph || 0,
    thr_thp: r.thr_thp || 0,
    bonus_nominal: r.bonus_nominal || 0,
    bonus_pph: r.bonus_pph || 0,
    bonus_thp: r.bonus_thp || 0,
    result_json: r,
    inputs_snapshot: r.inputs || {}
  }));

  // 3. Clear existing results for this run first (if any) or use upsert
  // Since we have a unique constraint on (run_id, employee_id), upsert is fine.
  const { error: resError } = await supabase
    .from('payroll_results')
    .upsert(resultsToInsert, { onConflict: 'run_id, employee_id' });

  if (resError) {
    console.error('Error saving payroll results:', resError);
    return { error: resError.message };
  }

  revalidatePath(`/companies/${companyId}/payroll/${tahun}/${bulan}`);
  return { success: true, runId: run.id };
}

export async function lockPayrollRun(runId: string, companyId: string, tahun: number, bulan: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('payroll_runs')
    .update({ 
      status: 'locked',
      locked_at: new Date().toISOString()
    })
    .eq('id', runId);

  if (error) return { error: error.message };

  revalidatePath(`/companies/${companyId}/payroll/${tahun}/${bulan}`);
  return { success: true };
}
