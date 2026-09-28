/** Phones are only ever displayed masked: six bullets then the last three digits. */
export function maskPhone(raw: string | null | undefined): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  if (digits.length < 3) return '—';
  return '•'.repeat(6) + digits.slice(-3);
}
