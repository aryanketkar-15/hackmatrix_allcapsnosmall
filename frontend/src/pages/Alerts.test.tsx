import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../test/renderApp';
import { readCore } from '../test/fixtures';
import { csvCell, toCsv } from '../lib/csv';
import { filterAlerts, EMPTY_FILTERS } from '../lib/alertFilters';

const core = readCore();

const rowCount = () => within(screen.getByRole('table', { name: 'Alerts' })).getAllByRole('row').length - 1;

describe('Alerts list', () => {
  it('shows 10 rows, "1–10 of 124" and 13 pages by default', async () => {
    renderAt('/alerts');
    await dataReady();
    expect(rowCount()).toBe(10);
    expect(screen.getByTestId('showing')).toHaveTextContent('Showing 1–10 of 124 alerts');
    expect(screen.getByRole('button', { name: '13' })).toBeInTheDocument();
  });

  it('High tab shows 28 rows across 3 pages', async () => {
    const user = userEvent.setup();
    renderAt('/alerts');
    await dataReady();
    await user.click(screen.getByRole('tab', { name: /^High/ }));
    expect(screen.getByTestId('showing')).toHaveTextContent('of 28 alerts');
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '4' })).not.toBeInTheDocument();
  });

  it('tab counts are computed', async () => {
    renderAt('/alerts');
    await dataReady();
    expect(screen.getByRole('tab', { name: /All Alerts \(124\)/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Medium \(52\)/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Explained \(3\)/ })).toBeInTheDocument();
  });

  it('combines filters as an intersection', async () => {
    const user = userEvent.setup();
    renderAt('/alerts?level=HIGH&type=CIRCULAR_TRANSFER');
    await dataReady();
    const expected = core.alerts.filter((a) => a.level === 'HIGH' && a.type === 'CIRCULAR_TRANSFER').length;
    expect(screen.getByTestId('showing')).toHaveTextContent(`of ${expected} alerts`);
    await user.type(screen.getByLabelText('Search alerts'), 'ALT-2024-001');
    await waitFor(() => expect(screen.getByTestId('showing')).toHaveTextContent('of 1 alerts'));
  });

  it('date range includes the whole end day (IST)', () => {
    const hero = core.alerts.find((a) => a.id === 'ALT-2024-001')!;
    const day = '2024-04-30';
    expect(filterAlerts([hero], { ...EMPTY_FILTERS, from: day, to: day })).toHaveLength(1);
    expect(filterAlerts([hero], { ...EMPTY_FILTERS, from: '2024-05-01', to: '' })).toHaveLength(0);
    expect(filterAlerts([hero], { ...EMPTY_FILTERS, from: '', to: '2024-04-29' })).toHaveLength(0);
  });

  it('last page has 4 rows and bad page params are clamped', async () => {
    renderAt('/alerts?page=13');
    await dataReady();
    expect(rowCount()).toBe(4);
  });

  it.each(['99', 'abc', '0', '-3'])('clamps page=%s', async (p) => {
    renderAt(`/alerts?page=${p}`);
    await dataReady();
    expect(rowCount()).toBeGreaterThan(0);
  });

  it('shows an empty state for impossible filters', async () => {
    renderAt('/alerts?q=zzzzzz');
    await dataReady();
    expect(screen.getByText('No alerts match')).toBeInTheDocument();
    expect(screen.getByTestId('showing')).toHaveTextContent('Showing 0 alerts');
  });

  it('has a level chip and no numeric score column', async () => {
    renderAt('/alerts');
    await dataReady();
    const headers = within(screen.getByRole('table', { name: 'Alerts' })).getAllByRole('columnheader').map((h) => h.textContent);
    expect(headers).toEqual(['ID', 'Time', 'Risk', 'Alert Title', 'Amount', 'Type', 'Status']);
    expect(document.body.textContent).not.toMatch(/Risk Score|\/100/);
  });

  it('navigates to the alert overview on row click', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/alerts');
    await dataReady();
    await user.click(within(screen.getByRole('table', { name: 'Alerts' })).getByText('ALT-2024-001'));
    expect(router.state.location.pathname).toBe('/alerts/ALT-2024-001/overview');
  });

  it('exports the filtered rows as RFC 4180 CSV with a BOM', async () => {
    const user = userEvent.setup();
    let blob: Blob | undefined;
    (URL as unknown as { createObjectURL: (b: Blob) => string }).createObjectURL = (b) => { blob = b; return 'blob:x'; };
    (URL as unknown as { revokeObjectURL: () => void }).revokeObjectURL = () => {};
    renderAt('/alerts?level=DATA_GAP');
    await dataReady();
    await user.click(screen.getByRole('button', { name: /Export/ }));
    const bytes = await new Promise<Uint8Array>((res) => { const r = new FileReader(); r.onload = () => res(new Uint8Array(r.result as ArrayBuffer)); r.readAsArrayBuffer(blob!); });
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]); // UTF-8 BOM
    const text = new TextDecoder().decode(bytes);
    const lines = text.trim().split('\r\n');
    expect(lines).toHaveLength(1 + 8); // header + 8 Inconclusive alerts
    expect(lines[0]).toContain('Amount (INR)');
  });
});

describe('csv', () => {
  it('quotes commas, quotes and newlines and keeps the rupee sign', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
    expect(toCsv(['x'], [['₹29,80,000']])).toBe('﻿x\r\n"₹29,80,000"\r\n');
  });
});
