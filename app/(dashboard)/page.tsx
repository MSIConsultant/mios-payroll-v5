import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has any workspace
  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('id, workspace_members!inner(*)')
    .eq('workspace_members.user_id', user.id);

  if (!workspaces || workspaces.length === 0) {
    redirect('/onboarding');
  }

  redirect('/companies');
}
