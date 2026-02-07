process.env.TZ = 'UTC';
import {formatDate, formatDateTime} from '../../../../src/views/hiv/format-date';

describe('HIV format-date utilities', () => {
  test('formatDateTime formats ISO string', () => {
    expect(formatDateTime('2020-01-31T12:34:56Z')).toBe('Jan 31, 2020, 12:34 PM');
  });

  test('formatDate formats compact date', () => {
    expect(formatDate('20200131')).toBe('Jan 31, 2020');
  });
});
