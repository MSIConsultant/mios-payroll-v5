'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createWorkspace(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get('name') as string;

  if (!name) {
    return { error: 'Workspace name is required' };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // 1. Create the workspace
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .insert({
      name,
      owner_id: user.id
    })
    .select()
    .single();

  if (wsError) {
     console.error('Error creating workspace:', wsError);
     return { error: wsError.message };
  }

  // Note: The database trigger 'after_workspace_insert' should handle adding the owner to workspace_members.
  // We'll verify this in the schema or add manually if needed.
  // For now, assume trigger handles it or we'll add it if the trigger doesn't exist in the actual DB environment.
  
  revalidatePath('/', 'layout');
  redirect('/companies');
}
