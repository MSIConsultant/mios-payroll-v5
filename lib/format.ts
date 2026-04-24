export function formatRupiah(n: number): string {
  // Convert standard JS number format to Indonesian format
  // Example: 9150000 -> "Rp 9.150.000"
  // Handles negatives as well: -100000 -> "-Rp 100.000" or "(Rp 100.000)" etc.
  // The SRS requires formatRupiah output like Rp 9.150.000
  if (n === null || n === undefined) return "Rp 0";
  return (n < 0 ? "-" : "") + "Rp " + Math.abs(n).toLocaleString("id-ID");
}

export function formatTER(rate: number | null): string {
  if (rate === null || rate === undefined) return "P17 ✓";
  return (rate * 100).toFixed(2) + "%";
}

export function formatPercent(rate: number): string {
  if (rate === null || rate === undefined) return "0.00%";
  return (rate * 100).toFixed(2) + "%";
}
