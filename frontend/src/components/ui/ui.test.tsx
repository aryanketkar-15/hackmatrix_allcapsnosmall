import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { LevelChip, Modal, Pagination, Tabs, pageWindow, clampPage } from './index';
import { LEVEL_STYLE, STATUS_STYLE } from './chipStyles';
import { contrastRatio } from '../../lib/contrast';
import { ALERT_LEVELS } from '../../types/contract';

describe('chips', () => {
  it('meets WCAG AA contrast', () => {
    for (const l of ALERT_LEVELS) expect(contrastRatio(LEVEL_STYLE[l].fg, LEVEL_STYLE[l].bg)).toBeGreaterThanOrEqual(4.5);
    for (const s of Object.values(STATUS_STYLE)) expect(contrastRatio(s.fg, s.bg)).toBeGreaterThanOrEqual(4.5);
  });
  it('always shows a text label', () => {
    render(<>{ALERT_LEVELS.map((l) => <LevelChip key={l} level={l} />)}</>);
    for (const t of ['High', 'Medium', 'Watch', 'Near-miss', 'Inconclusive', 'Explained']) expect(screen.getByText(t)).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  function Harness() {
    const [v, setV] = useState('a');
    return <Tabs value={v} onChange={setV} items={[{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }, { id: 'c', label: 'C', disabled: true }]} />;
  }
  it('moves with arrow keys, skipping disabled tabs', async () => {
    render(<Harness />);
    const a = screen.getByRole('tab', { name: 'A' });
    a.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'B' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('Modal', () => {
  it('closes on Escape and restores focus to the opener', async () => {
    function H() {
      const [open, setOpen] = useState(false);
      return (<><button onClick={() => setOpen(true)}>open</button><Modal open={open} title="T" onClose={() => setOpen(false)}>body</Modal></>);
    }
    render(<H />);
    const btn = screen.getByText('open');
    btn.focus();
    await userEvent.click(btn);
    expect(screen.getByText('body')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog', { hidden: true }), { key: 'Escape' });
    expect(screen.queryByText('body')).not.toBeInTheDocument();
    expect(btn).toHaveFocus();
  });
});

describe('Pagination', () => {
  it('is hidden for one page and windowed for many', () => {
    const { container, rerender } = render(<Pagination page={1} pageCount={1} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    expect(pageWindow(1, 13)).toEqual([1, 2, 3, 4, 5, '…', 13]);
    expect(pageWindow(7, 13)).toEqual([1, '…', 6, 7, 8, '…', 13]);
    expect(pageWindow(13, 13)).toEqual([1, '…', 9, 10, 11, 12, 13]);
    rerender(<Pagination page={1} pageCount={13} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '13' })).toBeInTheDocument();
  });
  it('clamps bad page values', () => {
    expect(clampPage('abc', 13)).toBe(1);
    expect(clampPage('99', 13)).toBe(13);
    expect(clampPage('0', 13)).toBe(1);
  });
});
