import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../test/renderApp';
import { readCore } from '../test/fixtures';

const core = readCore();

describe('Employees', () => {
  it('lists 30 employees across pages', async () => {
    renderAt('/employees');
    await dataReady();
    expect(screen.getByTestId('emp-showing')).toHaveTextContent('of 30 employees');
    expect(within(screen.getByRole('table', { name: 'Employees' })).getAllByRole('row')).toHaveLength(11);
  });

  it('searches by name', async () => {
    const user = userEvent.setup();
    renderAt('/employees');
    await dataReady();
    await user.type(screen.getByLabelText('Search employees'), 'Rohit');
    await waitFor(() => expect(screen.getByTestId('emp-showing')).toHaveTextContent('of 1 employees'));
  });

  it('E17 profile shows the same data as the alert tab', async () => {
    renderAt('/employees/E17');
    await dataReady();
    expect(await screen.findByText('Rohit Kumar')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Recent activities' });
    expect(within(table).getByText('Changed mobile number')).toBeInTheDocument();
    const list = await screen.findByRole('list', { name: 'Misuse signals' });
    for (const s of ['P1', 'P2', 'P3', 'P9']) expect(within(list).getByText(new RegExp(`^${s} ·`))).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Linked alerts' })).toHaveTextContent('ALT-2024-001');
  });

  it('unknown employee shows not-found', async () => {
    renderAt('/employees/NOPE');
    await dataReady();
    expect(await screen.findByText(/could not find that employee/i)).toBeInTheDocument();
  });

  it('signal counts come from the fixtures', () => {
    expect(core.employees.find((e) => e.id === 'E17')!.signalCount).toBe(4);
  });
});
