import { formatInr, formatDateTimeIST, formatRelativeToAsOf, formatBytes } from './format';
import { maskPhone } from './mask';
import { contrastRatio } from './contrast';

describe('format', () => {
  it('formats INR with Indian grouping', () => {
    expect(formatInr(2980000)).toBe('₹29,80,000');
    expect(formatInr(NaN)).toBe('—');
    expect(formatInr(undefined)).toBe('—');
  });
  it('formats IST datetimes and survives bad input', () => {
    expect(formatDateTimeIST('2024-04-30T09:12:00+05:30')).toBe('Apr 30, 2024, 09:12');
    expect(formatDateTimeIST('x')).toBe('—');
  });
  it('formats relative to the as-of time', () => {
    const asOf = '2024-04-30T18:00:00+05:30';
    expect(formatRelativeToAsOf('2024-04-30T10:50:00+05:30', asOf)).toBe('Today 10:50');
    expect(formatRelativeToAsOf('2024-04-29T19:33:00+05:30', asOf)).toBe('Yesterday 19:33');
    expect(formatRelativeToAsOf('2024-04-26T11:05:00+05:30', asOf)).toBe('Apr 26 11:05');
  });
  it('masks phones', () => {
    expect(maskPhone('9876543210')).toBe('••••••210');
    expect(maskPhone('12')).toBe('—');
  });
  it('formats bytes', () => expect(formatBytes(1536)).toBe('1.5 KB'));
  it('computes WCAG contrast', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
  });
});
