import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { Workspace } from '@/lib/types';

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkspaces() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('workspaces')
        .select('*, workspace_members!inner(*)')
        .eq('workspace_members.user_id', user.id);

      if (data && data.length > 0) {
        setWorkspaces(data);
        
        // Try to get active workspace from localStorage or default to first one
        const activeId = localStorage.getItem('active_workspace_id');
        const active = data.find(w => w.id === activeId) || data[0];
        setWorkspace(active);
        
        if (active.id !== activeId) {
          localStorage.setItem('active_workspace_id', active.id);
        }
      }
      setLoading(false);
    }

    fetchWorkspaces();
  }, []);

  const switchWorkspace = (id: string) => {
    const active = workspaces.find(w => w.id === id);
    if (active) {
      setWorkspace(active);
      localStorage.setItem('active_workspace_id', id);
      window.location.reload(); // Refresh to clear any cached data for the old workspace
    }
  };

  return { workspace, workspaces, loading, switchWorkspace };
}
