import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../../test/renderApp';
import { readScenario } from '../../test/fixtures';
import { ReachPanel, sortReach } from './ReachPanel';

const reach = readScenario('S1').reach;

describe('Reach panel', () => {
  it('sorts by exposure, descending', () => {
    const s = sortReach(reach).map((r) => r.exposure);
    expect(s).toEqual([...s].sort((a, b) => b - a));
    render(<ReachPanel reach={reach} />);
    const rows = within(screen.getByRole('table', { name: 'Exposure' })).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('A-114');
  });

  it('filters to Near-exposed only', async () => {
    const user = userEvent.setup();
    render(<ReachPanel reach={reach} />);
    await user.selectOptions(screen.getByLabelText('Filter exposure status'), 'NEAR');
    const rows = within(screen.getByRole('table', { name: 'Exposure' })).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => /Near/.test(r.textContent ?? ''))).toBe(true);
  });

  it('shows an empty state when nothing matches', () => {
    render(<ReachPanel reach={[]} />);
    expect(screen.getByText('No accounts in this state')).toBeInTheDocument();
  });

  it('labels values as scenario values and precomputed, in en-IN currency', () => {
    render(<ReachPanel reach={reach} />);
    expect(screen.getByText('Precomputed in prototype')).toBeInTheDocument();
    expect(screen.getByText(/Exposure \(scenario value\)/)).toBeInTheDocument();
    expect(screen.getByText('₹18,50,000')).toBeInTheDocument();
  });

  it('is reachable from the But-for tab and empty for scenarios without exposure', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-002/but-for');
    await dataReady();
    await user.click(await screen.findByRole('tab', { name: /Exposure/ }));
    expect(await screen.findByText('No accounts in this state')).toBeInTheDocument();
  });
});
