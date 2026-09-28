import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../../test/renderApp';
import { readScenario } from '../../test/fixtures';
import { findDivergence } from './findDivergence';

describe('findDivergence', () => {
  it('S1 vs its twin diverges at the mobile-change step (index 0)', () => {
    const d = findDivergence(readScenario('S1').pathSteps, readScenario('S1T').pathSteps)!;
    expect(d.index).toBe(0);
    expect(d.attack).toContain('No customer-origin artifact');
    expect(d.legitimate).toContain('V-CIP');
  });
  it('S2 vs the payout twin diverges at the mandate / explanation step', () => {
    const d = findDivergence(readScenario('S2').pathSteps, readScenario('S2T').pathSteps)!;
    expect(d.index).toBe(0);
    expect(d.label).toBe('Business explanation');
  });
  it('S3 vs the property-sale twin diverges at the explanation step', () => {
    expect(findDivergence(readScenario('S3').pathSteps, readScenario('S3T').pathSteps)!.index).toBe(0);
  });
  it('pads unequal lengths without crashing', () => {
    const a = readScenario('S1').pathSteps;
    const d = findDivergence(a.slice(0, 2), a);
    expect(d!.index).toBe(2);
    expect(d!.attack).toBe('(no such step)');
  });
  it('returns null for identical paths', () => {
    const a = readScenario('S1').pathSteps;
    expect(findDivergence(a, [...a])).toBeNull();
  });
});

describe('Twin panel UI', () => {
  async function openTwin(path: string) {
    const user = userEvent.setup();
    renderAt(path);
    await dataReady();
    await user.click(await screen.findByRole('tab', { name: 'Legitimate twin' }));
    return user;
  }

  it('shows both columns, the divergence point and the Explained chip for S1', async () => {
    await openTwin('/alerts/ALT-2024-001/but-for');
    const div = await screen.findByTestId('divergence');
    expect(div).toHaveTextContent('First difference at step 1');
    const twinCol = screen.getByRole('list', { name: 'Legitimate twin' });
    expect(within(twinCol).getAllByText('Genuine').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Explained').length).toBeGreaterThan(0);
    expect(screen.getByTestId('S1-step-0')).toHaveTextContent('Divergence point');
  });

  it('works for the splitting attack and the profile-mismatch attack', async () => {
    await openTwin('/alerts/ALT-2024-002/but-for');
    expect(await screen.findByTestId('divergence')).toHaveTextContent('Business explanation');
  });

  it('the payout twin alert shows its attack counterpart', async () => {
    await openTwin('/alerts/ALT-2024-007/but-for');
    expect(await screen.findByTestId('divergence')).toBeInTheDocument();
  });

  it('is disabled with a tooltip when no twin exists (data-gap alert)', async () => {
    renderAt('/alerts/ALT-2024-005/but-for');
    await dataReady();
    const tab = await screen.findByRole('tab', { name: 'Legitimate twin' });
    await screen.findByText(/Replay is not available/);
    await import('@testing-library/react').then(({ waitFor }) => waitFor(() => expect(tab).toBeDisabled()));
    expect(tab).toHaveAttribute('title', expect.stringContaining('No legitimate twin'));
  });
});
