process.env.TZ = 'UTC';
import {formatDate, formatDateTime} from '../../../../src/views/sars2/format-date';

describe('SARS2 format-date utilities', () => {
  test('formatDateTime formats ISO string or returns Unknown', () => {
    expect(formatDateTime('2020-01-31T12:34:56Z')).toBe('Jan 31, 2020, 12:34 PM');
    expect(formatDateTime()).toBe('Unknown');
  });

  test('formatDate formats compact date or returns Unknown', () => {
    expect(formatDate('20200131')).toBe('Jan 31, 2020');
    expect(formatDate()).toBe('Unknown');
  });
});
