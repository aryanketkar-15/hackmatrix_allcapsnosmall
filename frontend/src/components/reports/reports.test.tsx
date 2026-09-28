import { screen, waitFor, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../../test/renderApp';
import { buildPack, sha256Hex, verifyPack } from '../../lib/hash';
import { stableStringify } from '../../lib/stableStringify';
import { reportFilename } from './reportModel';

describe('stableStringify', () => {
  it('produces the same text regardless of key order', () => {
    expect(stableStringify({ b: 1, a: { d: 2, c: 3 } })).toBe(stableStringify({ a: { c: 3, d: 2 }, b: 1 }));
  });
});

describe('hash / pack', () => {
  const header = { alertId: 'ALT-2024-001', generatedAt: '2024-04-30T18:00:00+05:30' };
  const sections = [{ name: 'summary', content: { amount: '₹29,80,000', n: 3 } }, { name: 'timeline', content: [{ t: 1 }, { t: 2 }] }];

  it('sha256 matches a known vector and handles unicode', async () => {
    expect(await sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(await sha256Hex('₹')).toHaveLength(64);
  });
  it('is deterministic for identical input', async () => {
    const a = await buildPack(header, sections);
    const b = await buildPack(header, sections);
    expect(a.manifest.manifestHash).toBe(b.manifest.manifestHash);
  });
  it('verifies an intact pack, including a unicode payload after a JSON round trip', async () => {
    const pack = JSON.parse(JSON.stringify(await buildPack(header, sections)));
    expect(await verifyPack(pack)).toEqual({ ok: true });
  });
  it('detects a single altered character and names the section', async () => {
    const pack = JSON.parse(JSON.stringify(await buildPack(header, sections)));
    pack.sections[0].content.amount = '₹29,80,001';
    const r = await verifyPack(pack);
    expect(r).toMatchObject({ ok: false, item: 'summary' });
  });
  it('detects a changed header, a reordered manifest and non-pack files', async () => {
    const good = JSON.parse(JSON.stringify(await buildPack(header, sections)));
    expect((await verifyPack({ ...good, header: { ...good.header, alertId: 'ALT-2024-002' } })).ok).toBe(false);
    expect((await verifyPack({ ...good, sections: [...good.sections].reverse() })).ok).toBe(false);
    expect((await verifyPack({ hello: 'world' })).ok).toBe(false);
    expect((await verifyPack(null)).ok).toBe(false);
  });
  it('filename follows the convention', () => {
    expect(reportFilename('ALT-2024-001', '2024-04-30T18:00:00+05:30')).toBe('KHOJI_report_ALT-2024-001_20240430.json');
  });
});

async function generate(user: ReturnType<typeof userEvent.setup>, alert = 'ALT-2024-001') {
  await user.selectOptions(await screen.findByLabelText('Alert'), alert);
  await user.click(screen.getByRole('button', { name: 'Generate Report' }));
}

describe('Reports page', () => {
  it('requires an alert before generating', async () => {
    const user = userEvent.setup();
    renderAt('/reports');
    await dataReady();
    await user.click(await screen.findByRole('button', { name: 'Generate Report' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Select an alert');
  });

  it('previews the investigation report with the no-intent statement and precomputed labels', async () => {
    const user = userEvent.setup();
    renderAt('/reports');
    await dataReady();
    await generate(user);
    const preview = await screen.findByTestId('report-preview');
    expect(within(preview).getByLabelText('KHOJI')).toBeInTheDocument();
    expect(within(preview).getByTestId('report-statement')).toHaveTextContent('No finding of intent');
    expect(preview).toHaveTextContent('Precomputed in prototype');
    for (const s of ['Alert Summary', 'Timeline', 'Employee Activity', 'Evidence & Authorization', 'But-for Analysis', 'Supporting Documents']) {
      expect(within(preview).getByRole('region', { name: s })).toBeInTheDocument();
    }
  });

  it('falls back to an edge table when the graph snapshot cannot be captured', async () => {
    const user = userEvent.setup();
    renderAt('/reports');
    await dataReady();
    await generate(user);
    expect(await screen.findByTestId('edge-table-fallback', undefined, { timeout: 3000 })).toHaveTextContent('T4');
  });

  it('untick a section: it disappears from the preview and the pack', async () => {
    const user = userEvent.setup();
    let saved: Blob | undefined;
    (URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = (b) => { saved = b; return 'blob:x'; };
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
    renderAt('/reports');
    await dataReady();
    await user.click(await screen.findByLabelText('But-for Analysis'));
    await generate(user);
    const preview = await screen.findByTestId('report-preview');
    expect(within(preview).queryByRole('region', { name: 'But-for Analysis' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Download evidence pack/ }));
    const text = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsText(saved!); });
    const pack = JSON.parse(text);
    expect(pack.sections.map((s: { name: string }) => s.name)).not.toContain('butfor');
    expect(await verifyPack(pack)).toEqual({ ok: true });
  });

  it('the same alert generates the identical manifest hash twice', async () => {
    const user = userEvent.setup();
    renderAt('/reports');
    await dataReady();
    await generate(user);
    const first = (await screen.findByTestId('manifest-hash')).textContent;
    await act(async () => { await user.click(screen.getByRole('button', { name: 'Generate Report' })); });
    await waitFor(() => expect(screen.getByTestId('manifest-hash').textContent).toBe(first));
  });

  it('SUMMARY alerts include only the sections that exist for them', async () => {
    const user = userEvent.setup();
    renderAt('/reports');
    await dataReady();
    const summaryId = (await screen.findAllByRole('option')).map((o) => o.textContent!).find((t) => /ALT-2024-\d{3} –/.test(t) && !/\(full\)/.test(t))!.split(' ')[0];
    await generate(user, summaryId);
    const preview = await screen.findByTestId('report-preview');
    expect(within(preview).queryByRole('region', { name: 'Timeline' })).not.toBeInTheDocument();
    expect(within(preview).getByRole('region', { name: 'Evidence & Authorization' })).toBeInTheDocument();
  });

  it('verify: an intact download passes and a tampered one fails', async () => {
    const user = userEvent.setup();
    let saved: Blob | undefined;
    (URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = (b) => { saved = b; return 'blob:x'; };
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
    renderAt('/reports');
    await dataReady();
    await generate(user);
    await user.click(await screen.findByRole('button', { name: /Download evidence pack/ }));
    const text = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsText(saved!); });

    const input = screen.getByLabelText('Evidence pack file') as HTMLInputElement;
    await user.upload(input, new File([text], 'pack.json', { type: 'application/json' }));
    expect(await screen.findByTestId('verify-result')).toHaveTextContent('PASS');

    const tampered = text.replace('"amountAtRisk": 2980000', '"amountAtRisk": 2980001');
    expect(tampered).not.toBe(text);
    await user.upload(input, new File([tampered], 'bad.json', { type: 'application/json' }));
    await waitFor(() => expect(screen.getByTestId('verify-result')).toHaveTextContent('FAIL'));
  });
});
