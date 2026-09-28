import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../test/renderApp';
import { readCore } from '../test/fixtures';
import { analyzeProfile } from '../lib/profileAnalysis';
import { ProfileAnalysisPanel } from '../components/customers/ProfileAnalysisPanel';
import { MemoryRouter } from 'react-router-dom';

const core = readCore();
const cust = (id: string) => core.customers.find((c) => c.id === id)!;

describe('Customers list', () => {
  it('lists all 40 customers across pages', async () => {
    renderAt('/customers');
    await dataReady();
    expect(screen.getByTestId('cust-showing')).toHaveTextContent('of 40 customers');
    expect(within(screen.getByRole('table', { name: 'Customers' })).getAllByRole('row')).toHaveLength(11);
  });
  it('shows linked alert counts and searches by name', async () => {
    const user = userEvent.setup();
    renderAt('/customers');
    await dataReady();
    await user.type(screen.getByLabelText('Search customers'), 'Ravi');
    expect(await screen.findByText('Ravi Menon')).toBeInTheDocument();
    expect(screen.getByTestId('cust-showing')).toHaveTextContent('of 1 customers');
  });
});

describe('Customer profile', () => {
  it('shows the profile summary for C001 matching the fixture', async () => {
    renderAt('/customers/C001/overview');
    await dataReady();
    const c = cust('C001');
    expect(await screen.findByRole('heading', { name: c.name })).toBeInTheDocument();
    expect(screen.getByText('Profile Summary')).toBeInTheDocument();
    expect(screen.getByText(c.occupation)).toBeInTheDocument();
    expect(screen.getByText(c.maskedPhone)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Linked alerts' })).toHaveTextContent('ALT-2024-001');
  });

  it('S3 customer: observed inflow is many times the declared income and the edit is linked', async () => {
    renderAt('/customers/C005/analysis');
    await dataReady();
    const observed = await screen.findByTestId('pa-Observed inflow (Apr)');
    expect(observed).toHaveTextContent('₹18,00,000');
    expect(observed).toHaveTextContent('4.5×');
    expect(screen.getByTestId('profile-edit')).toHaveTextContent('E11');
    expect(screen.getByRole('link', { name: /View alert ALT-2024-003/ })).toBeInTheDocument();
  });

  it('explained twin customer shows the explanation evidence and no edit', async () => {
    renderAt('/customers/C006/analysis');
    await dataReady();
    expect(await screen.findByTestId('explanation')).toHaveTextContent('Registered sale deed');
    expect(screen.queryByTestId('profile-edit')).not.toBeInTheDocument();
  });

  it('unknown customer shows not-found and bad tab redirects', async () => {
    const { unmount } = renderAt('/customers/NOPE/overview');
    await dataReady();
    expect(await screen.findByText(/could not find that customer/i)).toBeInTheDocument();
    unmount();
    const { router } = renderAt('/customers/C001/bogus');
    await dataReady();
    expect(router.state.location.pathname).toBe('/customers/C001/overview');
  });

  it('deep links to a tab and shows accounts / transactions', async () => {
    renderAt('/customers/C001/transactions');
    await dataReady();
    const t = await screen.findByRole('table', { name: 'Customer transactions' });
    expect(t).toHaveTextContent('A-001');
  });

  it('customers without flows show an empty state and never NaN', () => {
    const c = { ...cust('C001'), monthlyFlows: [] };
    expect(analyzeProfile(c)).toMatchObject({ hasFlows: false, ratio: null, passThrough: null });
    render(<MemoryRouter><ProfileAnalysisPanel customer={c} /></MemoryRouter>);
    expect(screen.getByText('No transaction history for this customer')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  it('analysis is NaN-safe with zero declared income', () => {
    const a = analyzeProfile({ ...cust('C001'), annualIncome: 0 });
    expect(a.ratio).toBeNull();
  });
});
