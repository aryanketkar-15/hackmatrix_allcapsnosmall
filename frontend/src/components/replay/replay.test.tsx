import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../../test/renderApp';
import { readScenario } from '../../test/fixtures';
import { headlineText, matchVariant } from './matchVariant';

describe('matchVariant', () => {
  const rp = readScenario('S1').replay!;
  it('is order-insensitive', () => {
    const a = matchVariant(rp.variants, ['c-mobile', 'c-sms']);
    const b = matchVariant(rp.variants, ['c-sms', 'c-mobile']);
    expect(a).toBeDefined();
    expect(a).toBe(b);
  });
  it('returns undefined for a combination that is not precomputed', () => {
    expect(matchVariant(rp.variants, ['nope'])).toBeUndefined();
  });
  it('the headline of the hero alert is NECESSARY', () => {
    expect(headlineText(rp).role).toBe('NECESSARY');
  });
});

describe('But-for Replay UI', () => {
  it('shows the necessary banner, the four analysis steps and the precomputed label', async () => {
    renderAt('/alerts/ALT-2024-001/but-for');
    await dataReady();
    const banner = await screen.findByTestId('replay-banner');
    expect(banner).toHaveTextContent('NECESSARY');
    expect(banner).toHaveTextContent('would prevent the transaction path from executing');
    expect(screen.getByText('Analysis Steps').closest('div')!.parentElement!.querySelectorAll('ol > li')).toHaveLength(4);
    expect(screen.getByText('Precomputed in prototype')).toBeInTheDocument();
    expect(screen.getByTestId('replay-semantics')).toHaveTextContent('never intent');
  });

  it('uses a non-green banner colour for NECESSARY (deviation C8)', async () => {
    renderAt('/alerts/ALT-2024-001/but-for');
    await dataReady();
    const banner = await screen.findByTestId('replay-banner');
    expect(banner.style.backgroundColor).not.toMatch(/dcfce7|220, 252, 231|green/i);
  });

  it('removing the mobile change makes the path FAIL and cascades on the timeline', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-001/but-for');
    await dataReady();
    await user.click(await screen.findByRole('checkbox', { name: /Mobile number change/ }));
    expect(screen.getByTestId('replay-outcome')).toHaveTextContent('FAILS');
    await user.click(screen.getByRole('button', { name: 'View cascade on the timeline' }));
    const row = await screen.findByTestId('tl-ev-t4');
    expect(row.className).toContain('opacity-50');
    expect(within(row).getByText('not executed in replay')).toBeInTheDocument();
  });

  it('removing the concealing SMS still PASSES (role Concealing)', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-001/but-for');
    await dataReady();
    await user.click(await screen.findByRole('checkbox', { name: /SMS to new number/ }));
    expect(screen.getByTestId('replay-outcome')).toHaveTextContent('still PASSES');
    expect(screen.getByText('Concealing')).toBeInTheDocument();
  });

  it('Reset restores the untouched state', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-001/but-for');
    await dataReady();
    const box = await screen.findByRole('checkbox', { name: /Mobile number change/ });
    await user.click(box);
    await user.click(screen.getByRole('button', { name: /Reset/ }));
    expect(box).not.toBeChecked();
    expect(screen.getByTestId('replay-outcome')).toHaveTextContent('Tick one or more');
  });

  it('S2: either raise alone still passes, both together fail (jointly necessary)', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-002/but-for');
    await dataReady();
    expect(await screen.findByTestId('replay-banner')).toHaveTextContent('JOINTLY NECESSARY');
    await user.click(await screen.findByRole('checkbox', { name: /Per-transaction limit raise/ }));
    expect(screen.getByTestId('replay-outcome')).toHaveTextContent('still PASSES');
    await user.click(screen.getByRole('checkbox', { name: /Daily limit raise/ }));
    expect(screen.getByTestId('replay-outcome')).toHaveTextContent('FAILS');
  });

  it('is honest when replay is not available (data gap / near-miss / sweep)', async () => {
    const { unmount } = renderAt('/alerts/ALT-2024-005/but-for');
    await dataReady();
    expect(await screen.findByText(/replay coverage is below the threshold/)).toBeInTheDocument();
    unmount();
    renderAt('/alerts/ALT-2024-006/but-for');
    await dataReady();
    expect(await screen.findByText(/genuine control held/)).toBeInTheDocument();
  });

  it('clears the overlay when leaving the replay view', async () => {
    const user = userEvent.setup();
    renderAt('/alerts/ALT-2024-001/but-for');
    await dataReady();
    await user.click(await screen.findByRole('checkbox', { name: /Mobile number change/ }));
    await user.click(screen.getByRole('tab', { name: 'Timeline' }));
    await waitFor(() => expect(screen.getByTestId('tl-ev-t4').className).not.toContain('opacity-50'));
    expect(screen.queryByText('Clear overlay')).not.toBeInTheDocument();
  });
});
