/** NPWP: XX.XXX.XXX.X-XXX.XXX (15 digits) */
export function formatNPWP(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 15);
  let out = '';
  for (let i = 0; i < d.length; i++) {
    if (i === 2 || i === 5 || i === 8) out += '.';
    if (i === 9) out += '-';
    out += d[i];
  }
  return out;
}

/** NIK: exactly 16 numeric digits */
export function formatNIK(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 16);
}

/** Nominal: Indonesian thousand separator display */
export function formatNominalDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
}

/** Parse back to raw string for form submission */
export function parseNominalToString(display: string): string {
  return display.replace(/\./g, '') || '0';
}
