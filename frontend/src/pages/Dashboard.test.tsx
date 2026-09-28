import { screen, within } from '@testing-library/react';
import { dataReady, renderAt } from '../test/renderApp';
import { readCore } from '../test/fixtures';
import { KpiRow } from '../components/dashboard/KpiRow';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { TopPatterns } from '../components/dashboard/TopPatterns';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { StoreProvider, useStore } from '../data/store';
import { testLoader } from '../test/fixtures';
import { useEffect } from 'react';

const core = readCore();

describe('Dashboard', () => {
  it('shows KPI values 124 / 28 / 46 / 32', async () => {
    renderAt('/dashboard');
    await dataReady();
    const val = (label: string) => within(screen.getByTestId(`kpi-${label}`)).getByText(/^\d+$/).textContent;
    expect([val('Total Alerts'), val('High Risk'), val('Under Investigation'), val('Closed This Week')]).toEqual(['124', '28', '46', '32']);
  });

  it('lists the 5 newest alerts, newest first, with relative time', async () => {
    renderAt('/dashboard');
    await dataReady();
    const table = screen.getByRole('table', { name: 'Recent alerts' });
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(5);
    expect(rows[0]).toHaveTextContent('Today 10:50');
    expect(rows[0]).toHaveTextContent('Circular transfer with employee link');
    expect(rows[0]).toHaveTextContent('₹29,80,000');
    expect(rows[0]).toHaveTextContent('3 accounts, 2 employees');
  });

  it('shows the 7 top patterns in count order without the small ones', async () => {
    renderAt('/dashboard');
    await dataReady();
    const counts = [...document.querySelectorAll('[data-testid^="pattern-"]')].map((e) => e.textContent);
    expect(counts).toEqual(['28', '24', '18', '14', '12', '10', '8']);
    expect(screen.queryByText('Profile Mismatch')).not.toBeInTheDocument();
  });

  it('recalculates KPIs live when an alert changes', async () => {
    function Mutate() {
      const { state, dispatch } = useStore();
      useEffect(() => {
        if (state.phase === 'ready') {
          const a = state.alerts.find((x) => x.status === 'NEW')!;
          dispatch({ type: 'UPDATE_ALERT', id: a.id, patch: { status: 'INVESTIGATING', assignedTo: 'Raj Mehta' } });
        }
      }, [state.phase]); // eslint-disable-line react-hooks/exhaustive-deps
      return state.phase === 'ready' ? <KpiRow alerts={state.alerts} asOf={state.core!.meta.asOf} /> : null;
    }
    render(<MemoryRouter><StoreProvider loader={testLoader()}><Mutate /></StoreProvider></MemoryRouter>);
    expect(await screen.findByText('47')).toBeInTheDocument();
  });

  it('hides deltas without prior-week data and never shows NaN', () => {
    const only = core.alerts.map((a) => ({ ...a, createdAt: '2024-04-30T09:00:00+05:30', closedAt: null }));
    render(<KpiRow alerts={only} asOf={core.meta.asOf} />);
    expect(screen.queryByText(/from last week/)).not.toBeInTheDocument();
  });

  it('renders empty states without NaN', () => {
    render(<MemoryRouter><KpiRow alerts={[]} asOf={core.meta.asOf} /><RecentAlerts alerts={[]} asOf={core.meta.asOf} /><TopPatterns alerts={[]} /></MemoryRouter>);
    expect(screen.getByText('No alerts yet')).toBeInTheDocument();
    expect(screen.getByText('No patterns yet')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });
});
