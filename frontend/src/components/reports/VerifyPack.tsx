import { useState } from 'react';
import { ShieldCheck, ShieldX } from 'lucide-react';
import { Card, CardHeader } from '../ui';
import { verifyPack, type VerifyResult } from '../../lib/hash';

export function VerifyPack() {
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [name, setName] = useState('');

  async function onFile(file: File | undefined) {
    if (!file) return;
    setName(file.name);
    try {
      const text = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsText(file); });
      setResult(await verifyPack(JSON.parse(text)));
    } catch {
      setResult({ ok: false, reason: 'This file could not be read as a KHOJI evidence pack.' });
    }
  }

  return (
    <Card>
      <CardHeader title="Verify an evidence pack" />
      <div className="space-y-2 px-4 pb-4 text-xs">
        <p className="text-muted">Choose a downloaded pack. Every section hash and the manifest chain are recomputed; any altered character fails.</p>
        <input type="file" accept="application/json,.json" aria-label="Evidence pack file" onChange={(e) => onFile(e.target.files?.[0])} />
        {result ? (
          <p role="status" data-testid="verify-result" className={`flex items-start gap-2 rounded px-3 py-2 font-medium ${result.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-risk-high'}`}>
            {result.ok ? <ShieldCheck size={16} aria-hidden /> : <ShieldX size={16} aria-hidden />}
            <span>{result.ok ? `PASS — ${name} is intact.` : `FAIL — ${result.reason}${result.item ? ` (item: ${result.item})` : ''}`}</span>
          </p>
        ) : null}
      </div>
    </Card>
  );
}
