'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCompany(formData: FormData) {
  const supabase = await createClient();
  
  const workspace_id = formData.get('workspace_id') as string;
  const name = formData.get('name') as string;
  const npwp_perusahaan = formData.get('npwp_perusahaan') as string;
  const alamat = formData.get('alamat') as string;
  const kota = formData.get('kota') as string;
  const industri = formData.get('industri') as string;

  if (!name || !workspace_id) {
    return { error: 'Company name and workspace are required' };
  }

  const { error } = await supabase
    .from('companies')
    .insert({
      workspace_id,
      name,
      npwp_perusahaan,
      alamat,
      kota,
      industri,
      aktif: true
    });

  if (error) {
    console.error('Error creating company:', error);
    return { error: error.message };
  }

  revalidatePath('/companies');
  return { success: true };
}

export async function updateCompany(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const name = formData.get('name') as string;
  const npwp_perusahaan = formData.get('npwp_perusahaan') as string;
  const alamat = formData.get('alamat') as string;
  const kota = formData.get('kota') as string;
  const industri = formData.get('industri') as string;

  if (!name) {
    return { error: 'Company name is required' };
  }

  const { error } = await supabase
    .from('companies')
    .update({
      name,
      npwp_perusahaan,
      alamat,
      kota,
      industri,
    })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/companies');
  revalidatePath(`/companies/${id}`);
  return { success: true };
}

export async function archiveCompany(id: string, aktif: boolean) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('companies')
    .update({ aktif })
    .eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/companies');
  return { success: true };
}
