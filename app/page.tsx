import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hasSupabaseEnv } from '@/lib/env';
import SetupRequired from '@/components/SetupRequired';

export default async function Home() {
  if (!hasSupabaseEnv()) {
    return <SetupRequired />;
  }

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  } else {
    redirect('/dashboard');
  }
}
