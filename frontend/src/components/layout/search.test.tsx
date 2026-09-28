import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readCore, readScenario } from '../../test/fixtures';
import { buildIndex, search } from '../../lib/searchIndex';
import { dataReady, renderAt } from '../../test/renderApp';

const core = readCore();
const index = buildIndex(core, ['S1', 'S2'].map(readScenario));

describe('search ranking (pure)', () => {
  it('puts an exact id first', () => {
    expect(search(index, 'ALT-2024-001')[0].id).toBe('ALT-2024-001');
  });
  it('ranks prefix matches before contains', () => {
    const r = search(index, 'E1');
    const firstContains = r.findIndex((e) => !e.id.toLowerCase().startsWith('e1') && !e.label.toLowerCase().startsWith('e1'));
    const lastPrefix = r.map((e) => e.id.toLowerCase().startsWith('e1') || e.label.toLowerCase().startsWith('e1')).lastIndexOf(true);
    if (firstContains !== -1) expect(lastPrefix).toBeLessThan(firstContains);
  });
  it('caps results at 8 and returns none for no match', () => {
    expect(search(index, 'a').length).toBeLessThanOrEqual(8);
    expect(search(index, 'zzzzzz')).toEqual([]);
    expect(search(index, '   ')).toEqual([]);
  });
  it('indexes scenario transactions with a route to the alert graph', () => {
    const t = index.find((e) => e.kind === 'transaction' && e.id === 'S1:T4');
    expect(t?.to).toBe('/alerts/ALT-2024-001/graph');
  });
});

describe('global search UI', () => {
  it('finds an alert by id and navigates with Enter', async () => {
    const user = userEvent.setup();
    const { router } = renderAt('/dashboard');
    await dataReady();
    const box = screen.getByLabelText('Global search');
    await user.click(box);
    await user.type(box, 'ALT-2024-001');
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
    expect(within(screen.getByRole('listbox')).getAllByRole('option')[0]).toHaveTextContent('ALT-2024-001');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(router.state.location.pathname).toBe('/alerts/ALT-2024-001/overview'));
  });

  it('shows "No matches" for gibberish', async () => {
    const user = userEvent.setup();
    renderAt('/dashboard');
    await dataReady();
    await user.type(screen.getByLabelText('Global search'), 'zzz');
    await waitFor(() => expect(screen.getByText(/No matches/)).toBeInTheDocument());
  });

  it('shows unsafe text literally and executes nothing', async () => {
    const user = userEvent.setup();
    const { container } = renderAt('/dashboard');
    await dataReady();
    await user.type(screen.getByLabelText('Global search'), '<img src=x onerror=alert(1)>');
    await waitFor(() => expect(screen.getByText(/No matches for/)).toBeInTheDocument());
    expect(container.querySelector('img')).toBeNull();
  });

  it('"/" focuses the search box', async () => {
    renderAt('/dashboard');
    await dataReady();
    fireEvent.keyDown(document.body, { key: '/' });
    expect(screen.getByLabelText('Global search')).toHaveFocus();
  });

  it('bell lists the 5 most recent HIGH alerts and clears unread on open', async () => {
    const user = userEvent.setup();
    renderAt('/dashboard');
    await dataReady();
    expect(screen.getByTestId('bell-unread')).toHaveTextContent('5');
    await user.click(screen.getByRole('button', { name: /Notifications/ }));
    expect(screen.getAllByRole('menuitem').filter((m) => m.textContent?.includes('ALT-2024')).length).toBe(5);
    expect(screen.queryByTestId('bell-unread')).not.toBeInTheDocument();
  });
});
