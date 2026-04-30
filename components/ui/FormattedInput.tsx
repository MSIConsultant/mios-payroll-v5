'use client';
import { useState } from 'react';
import { formatNPWP, formatNIK, formatNominalDisplay, parseNominalToString } from '@/lib/formatters';

const BASE = "w-full px-3 py-2.5 bg-[#0D0D0F] border rounded-lg text-sm text-zinc-200 placeholder:text-zinc-700 outline-none transition-colors font-mono";

function useFocus() {
  const [focused, setFocused] = useState(false);
  return {
    focused,
    style: { borderColor: focused ? 'rgba(212,175,55,0.4)' : '#1A1A1C' },
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
  };
}

export function NpwpInput({ name, defaultValue = '', required, label }:
  { name: string; defaultValue?: string; required?: boolean; label: string }) {
  const [val, setVal] = useState(defaultValue);
  const focus = useFocus();
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{label}</label>
      <input type="text" inputMode="numeric" name={name} value={val} required={required}
        placeholder="00.000.000.0-000.000"
        onChange={e => setVal(formatNPWP(e.target.value))}
        className={BASE} {...focus} />
    </div>
  );
}

export function NikInput({ name, defaultValue = '', required, label }:
  { name: string; defaultValue?: string; required?: boolean; label: string }) {
  const [val, setVal] = useState(defaultValue);
  const focus = useFocus();
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{label}</label>
      <input type="text" inputMode="numeric" name={name} value={val} required={required}
        placeholder="0000000000000000"
        onChange={e => setVal(formatNIK(e.target.value))}
        className={BASE} {...focus} />
      <p className={`text-[10px] mt-1 transition-colors ${
        val.length === 16 ? 'text-green-500' : val.length > 0 ? 'text-amber-500' : 'text-zinc-800'
      }`}>
        {val.length === 16 ? '✓ 16 digit valid' : val.length > 0 ? `${16 - val.length} digit lagi` : '16 digit diperlukan'}
      </p>
    </div>
  );
}

export function NominalInput({ name, defaultValue = 0, label, required }:
  { name: string; defaultValue?: number; label: string; required?: boolean }) {
  const [display, setDisplay] = useState(defaultValue ? defaultValue.toLocaleString('id-ID') : '');
  const [raw, setRaw]         = useState(String(defaultValue || 0));
  const focus = useFocus();
  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">{label}</label>
      <input type="hidden" name={name} value={raw} />
      <input type="text" inputMode="numeric" value={display} required={required}
        placeholder="0"
        onChange={e => {
          const fmt = formatNominalDisplay(e.target.value);
          setDisplay(fmt);
          setRaw(parseNominalToString(fmt));
        }}
        className={BASE} {...focus} />
    </div>
  );
}
