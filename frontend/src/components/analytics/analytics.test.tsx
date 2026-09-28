import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../../test/renderApp';
import { readCore } from '../../test/fixtures';
import { AlertAnalytics, typeDistribution } from './AlertAnalytics';
import { EvaluationPanel } from './EvaluationPanel';
import { MetricsFile, type MetricsFileT } from '../../types/contract';
import { weeklyByType } from '../../lib/metrics';
import sample from '../../test/metrics_measured.sample.json';

const { alerts } = readCore();
const pending: MetricsFileT = JSON.parse(readFileSync(resolve(__dirname, '../../../public/fixtures/metrics.json'), 'utf-8'));

describe('alert analytics', () => {
  it('weekly buckets: 5 weeks whose sums equal the type counts', () => {
    const types = ['CIRCULAR_TRANSFER', 'STRUCTURING', 'FAN_OUT', 'FAN_IN', 'PASS_THROUGH'] as const;
    const rows = weeklyByType(alerts, '2024-04-01', 5, [...types]);
    expect(rows).toHaveLength(5);
    expect(rows.reduce((s, r) => s + r.CIRCULAR_TRANSFER, 0)).toBe(28);
  });
  it('type distribution percentages sum to 100 and counts to 124', () => {
    const d = typeDistribution(alerts);
    expect(d.reduce((s, x) => s + x.pct, 0)).toBe(100);
    expect(d.reduce((s, x) => s + x.count, 0)).toBe(124);
  });
  it('renders the legend and accessible data table', () => {
    render(<AlertAnalytics alerts={alerts} startKey="2024-04-01" />);
    expect(screen.getByRole('table', { name: 'Alerts by type legend' })).toHaveTextContent('Circular Transfer');
    expect(within(screen.getByRole('table', { name: 'Weekly pattern data' })).getAllByRole('row')).toHaveLength(6);
  });
  it('shows no-data states', () => {
    render(<AlertAnalytics alerts={[]} startKey="2024-04-01" />);
    expect(screen.getAllByText('No data')).toHaveLength(2);
  });
});

describe('evaluation tab (honest)', () => {
  it('shows the pending banner and only em dashes in value cells', () => {
    render(<EvaluationPanel metrics={pending} />);
    expect(screen.getByTestId('eval-banner')).toHaveTextContent('Evaluation pending');
    const cells = pending.definitions.map((d) => screen.getByTestId(`value-${d.id}`).textContent);
    expect(cells.every((c) => c === '—')).toBe(true);
    expect(cells.join('')).not.toMatch(/[0-9%]/);
  });
  it('lists B0–B4, ablations and uses the PS wording', () => {
    render(<EvaluationPanel metrics={pending} />);
    expect(within(screen.getByRole('list', { name: 'Baselines' })).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByRole('list', { name: 'Ablations' })).toBeInTheDocument();
    expect(document.body.textContent).toMatch(/detection accuracy/i);
    expect(document.body.textContent).toMatch(/false-positive rate/i);
  });
  it('shows values only for a MEASURED file (test-only sample)', () => {
    render(<EvaluationPanel metrics={sample as MetricsFileT} />);
    expect(screen.getByTestId('value-M01')).toHaveTextContent('0.5');
    expect(screen.getByTestId('eval-banner')).toHaveTextContent('Measured results');
  });
  it('rejects an unknown status with an error panel', () => {
    render(<EvaluationPanel metrics={{ ...pending, status: 'SOMETHING' } as unknown as MetricsFileT} />);
    expect(screen.getByRole('alert')).toHaveTextContent('unrecognised status');
  });
  it('the contract refuses pending metrics that carry values', () => {
    expect(MetricsFile.safeParse({ ...pending, values: { M01: 1 } }).success).toBe(false);
  });
  it('the measured sample is never shipped with the app', () => {
    expect(existsSync(resolve(__dirname, '../../../public/fixtures/metrics_measured.sample.json'))).toBe(false);
    expect(existsSync(resolve(__dirname, '../../../public/fixtures/metrics.json'))).toBe(true);
    expect(pending.status).toBe('PENDING_EVALUATION');
  });
});

describe('Analytics page', () => {
  it('switches to the Evaluation tab through the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/analytics');
    await dataReady();
    await user.click(await screen.findByRole('tab', { name: 'Evaluation' }));
    expect(router.state.location.search).toBe('?tab=evaluation');
    expect(await screen.findByTestId('eval-banner')).toBeInTheDocument();
  });
});
