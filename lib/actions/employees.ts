'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createEmployee(formData: FormData) {
  const supabase = await createClient();
  
  const fields: any = {};
  formData.forEach((value, key) => {
    if (key.startsWith('$')) return; // ignore nextjs internal fields
    
    // Convert numbers
    if (['gaji_pokok', 'benefit', 'kendaraan', 'pulsa', 'operasional', 'tunj_lain', 'upah_harian', 'hari_kerja_default', 'upah_bulanan_tt', 'tunjangan_tt'].includes(key)) {
      fields[key] = Number(value) || 0;
    } else if (['jkk_rate'].includes(key)) {
      fields[key] = Number(value) || 0;
    } else if (['punya_npwp', 'ikut_jht', 'ikut_jp', 'ikut_jkp', 'tanggung_jht_k', 'tanggung_jp_k', 'ikut_kes', 'tanggung_kes_k', 'pph_ditanggung', 'ikut_bpjs_tk', 'aktif'].includes(key)) {
      fields[key] = value === 'on' || value === 'true';
    } else {
      fields[key] = value;
    }
  });

  const { error } = await supabase
    .from('employees')
    .insert(fields);

  if (error) {
    console.error('Error creating employee:', error);
    return { error: error.message };
  }

  revalidatePath(`/companies/${fields.company_id}`);
  return { success: true };
}

export async function updateEmployee(id: string, companyId: string, formData: FormData) {
  const supabase = await createClient();
  
  const fields: any = {};
  formData.forEach((value, key) => {
    if (key.startsWith('$')) return;
    
    if (['gaji_pokok', 'benefit', 'kendaraan', 'pulsa', 'operasional', 'tunj_lain', 'upah_harian', 'hari_kerja_default', 'upah_bulanan_tt', 'tunjangan_tt'].includes(key)) {
      fields[key] = Number(value) || 0;
    } else if (['jkk_rate'].includes(key)) {
      fields[key] = Number(value) || 0;
    } else if (['punya_npwp', 'ikut_jht', 'ikut_jp', 'ikut_jkp', 'tanggung_jht_k', 'tanggung_jp_k', 'ikut_kes', 'tanggung_kes_k', 'pph_ditanggung', 'ikut_bpjs_tk', 'aktif'].includes(key)) {
      fields[key] = value === 'on' || value === 'true';
    } else {
      fields[key] = value;
    }
  });

  const { error } = await supabase
    .from('employees')
    .update(fields)
    .eq('id', id);

  if (error) {
    console.error('Error updating employee:', error);
    return { error: error.message };
  }

  revalidatePath(`/companies/${companyId}`);
  revalidatePath(`/companies/${companyId}/employees/${id}`);
  return { success: true };
}

export async function deleteEmployee(id: string, companyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/companies/${companyId}`);
  return { success: true };
}

export async function addEvent(formData: FormData) {
  const supabase = await createClient();
  
  const employee_id = formData.get('employee_id') as string;
  const company_id = formData.get('company_id') as string;
  const tahun = Number(formData.get('tahun'));
  const bulan = Number(formData.get('bulan'));
  const tipe = formData.get('tipe') as string;
  const nilai = Number(formData.get('nilai'));
  const keterangan = formData.get('keterangan') as string;

  const { error } = await supabase
    .from('employee_events')
    .insert({
      employee_id,
      company_id,
      tahun,
      bulan,
      tipe,
      nilai,
      keterangan
    });

  if (error) return { error: error.message };
  
  revalidatePath(`/companies/${company_id}/employees/${employee_id}`);
  return { success: true };
}

export async function deleteEvent(id: string, companyId: string, employeeId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('employee_events').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/companies/${companyId}/employees/${employeeId}`);
  return { success: true };
}
