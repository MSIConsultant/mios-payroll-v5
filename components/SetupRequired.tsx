export default function SetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 text-[#E4E4E7]">
      <div className="max-w-xl w-full bg-[#0A0A0B] rounded-none shadow-2xl p-8 border border-[#27272A]">
        <h2 className="text-2xl font-serif italic text-red-500 mb-2">Supabase Setup Required</h2>
        <p className="text-sm text-zinc-400 mb-6 font-mono">
          This payroll application requires Supabase for user authentication and managing employee data securely. 
          Please configure the following environment variables in your AI Studio Settings:
        </p>
        <div className="bg-[#0E0E10] p-6 font-mono text-sm mb-6 overflow-x-auto border border-[#27272A]">
          <div className="mb-4">
            <span className="text-zinc-500 block text-[10px] uppercase tracking-widest font-bold mb-1">Target Variable 1</span>
            <span className="text-[#D4AF37] select-all">NEXT_PUBLIC_SUPABASE_URL</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase tracking-widest font-bold mb-1">Target Variable 2</span>
            <span className="text-[#D4AF37] select-all">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
          </div>
        </div>

        <div className="bg-[#18181B] border border-[#27272A] p-4 text-sm text-zinc-300 mb-6 font-mono">
          <p className="font-bold text-[#E4E4E7] mb-2 uppercase tracking-widest text-[10px]">Instructions:</p>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>Open the <strong>Settings</strong> panel in AI Studio.</li>
            <li>Add the two variables exactly as named above.</li>
            <li>Use the URL and public anon key from your Supabase Project Settings ({'>'} API).</li>
          </ul>
        </div>
        
        <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-center">
          Refresh this page once you have configured the environment variables.
        </p>
      </div>
    </div>
  );
}
