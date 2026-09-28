import { fireEvent, render, screen, within } from '@testing-library/react';
import { Timeline, groupByDay } from './Timeline';
import { readScenario } from '../../test/fixtures';

const s1 = readScenario('S1');

describe('Timeline', () => {
  it('lists events in ascending order with all four categories', () => {
    render(<Timeline entries={s1.timeline} selection={null} onSelect={() => {}} />);
    const items = screen.getAllByRole('listitem');
    const times = items.map((li) => li.querySelector('time')!.getAttribute('datetime')!);
    expect(times).toEqual([...times].sort());
    for (const c of ['Employee Activity', 'Account State Change', 'Control Check', 'Transaction']) {
      expect(screen.getAllByText(c).length).toBeGreaterThan(0);
    }
  });

  it('shows the cooling-period override as a Control Check row', () => {
    render(<Timeline entries={s1.timeline} selection={null} onSelect={() => {}} />);
    const row = screen.getByTestId('tl-ev-cooldown');
    expect(row).toHaveTextContent('Cooling period overridden at branch');
    expect(within(row).getByText('Control Check')).toBeInTheDocument();
  });

  it('groups multi-day scenarios under separate date headers', () => {
    expect(groupByDay(s1.timeline).map((g) => g.label)).toEqual(['Apr 29, 2024', 'Apr 30, 2024']);
    render(<Timeline entries={s1.timeline} selection={null} onSelect={() => {}} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2);
  });

  it('renders a dashed missing-evidence row for gaps', () => {
    render(<Timeline entries={readScenario('S5').timeline} selection={null} onSelect={() => {}} />);
    const row = screen.getByTestId('tl-ev-gap-mfa');
    expect(row.className).toContain('border-dashed');
    expect(within(row).getByText('Missing evidence')).toBeInTheDocument();
  });

  it('never shows an unmasked phone number', () => {
    render(<Timeline entries={s1.timeline} selection={null} onSelect={() => {}} />);
    expect(document.body.textContent).not.toMatch(/(?<!\d)\d{10}(?!\d)/);
  });

  it('reports selections and highlights the selected row (txn selection maps to its event)', () => {
    const onSelect = vi.fn();
    const { rerender } = render(<Timeline entries={s1.timeline} selection={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('tl-ev-t4'));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'txn', id: 'T4' });
    fireEvent.click(screen.getByTestId('tl-ev-mobile'));
    expect(onSelect).toHaveBeenCalledWith({ kind: 'event', id: 'ev-mobile' });
    rerender(<Timeline entries={s1.timeline} selection={{ kind: 'txn', id: 'T4' }} onSelect={onSelect} />);
    expect(screen.getByTestId('tl-ev-t4')).toHaveAttribute('aria-current', 'true');
    expect(screen.getByTestId('tl-ev-t2')).not.toHaveAttribute('aria-current');
  });

  it('greys out overlay events with a "not executed" note', () => {
    render(<Timeline entries={s1.timeline} selection={null} onSelect={() => {}} overlay={['ev-t4']} />);
    const row = screen.getByTestId('tl-ev-t4');
    expect(row.className).toContain('opacity-50');
    expect(within(row).getByText('not executed in replay')).toBeInTheDocument();
  });

  it('shows clock-skew uncertainty where present', () => {
    render(<Timeline entries={s1.timeline} selection={null} onSelect={() => {}} />);
    expect(within(screen.getByTestId('tl-ev-mobile')).getByText('±30 s')).toBeInTheDocument();
  });
});
