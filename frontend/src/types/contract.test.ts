import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SCHEMAS, LEVEL_LABEL, ALERT_LEVELS } from './contract';

const dir = resolve(__dirname, '../../../data/contract-samples');
const manifest: { file: string; schema: keyof typeof SCHEMAS; valid: boolean }[] = JSON.parse(
  readFileSync(resolve(dir, 'manifest.json'), 'utf-8'),
);

describe('contract samples (parity with pydantic)', () => {
  it.each(manifest)('$file → valid=$valid', ({ file, schema, valid }) => {
    const data = JSON.parse(readFileSync(resolve(dir, file), 'utf-8'));
    const r = SCHEMAS[schema].safeParse(data);
    expect(r.success).toBe(valid);
  });

  it('rejects a numeric risk score structurally (PS: no opaque single score)', () => {
    const data = JSON.parse(readFileSync(resolve(dir, 'valid_alert.json'), 'utf-8'));
    expect(SCHEMAS.Alert.safeParse({ ...data, riskScore: 92 }).success).toBe(false);
  });

  it('has a display label for every level', () => {
    for (const l of ALERT_LEVELS) expect(LEVEL_LABEL[l]).toBeTruthy();
    expect(LEVEL_LABEL.DATA_GAP).toBe('Inconclusive');
  });
});
