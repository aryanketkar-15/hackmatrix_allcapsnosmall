import { render, screen, within } from '@testing-library/react';
import { AlertTrend } from './AlertTrend';
import { RiskDonut } from './RiskDonut';
import { readCore } from '../../test/fixtures';

const { alerts } = readCore();

describe('dashboard charts', () => {
  it('donut legend lists 6 levels with counts and percentages totalling 100', () => {
    render(<RiskDonut alerts={alerts} />);
    const legend = screen.getByRole('table', { name: 'Risk distribution legend' });
    const rows = within(legend).getAllByRole('row');
    expect(rows).toHaveLength(6);
    const pct = rows.map((r) => Number(/\((\d+)%\)/.exec(r.textContent ?? '')![1]));
    expect(pct.reduce((a, b) => a + b, 0)).toBe(100);
    expect(screen.getByText('124')).toBeInTheDocument();
  });

  it('exposes an accessible data table matching the series', () => {
    render(<AlertTrend alerts={alerts} startKey="2024-04-01" endKey="2024-04-30" />);
    const t = screen.getByRole('table', { name: 'Alert trend data' });
    const rows = within(t).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(30);
    const sum = (col: number) => rows.reduce((s, r) => s + Number(within(r).getAllByRole('cell')[col].textContent), 0);
    expect([sum(1), sum(2), sum(3)]).toEqual([28, 52, 30]);
  });

  it('shows a no-data state for empty input', () => {
    render(<><RiskDonut alerts={[]} /><AlertTrend alerts={[]} startKey="2024-04-01" endKey="2024-04-30" /></>);
    expect(screen.getAllByText('No data')).toHaveLength(2);
  });
});
