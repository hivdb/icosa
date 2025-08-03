import {describe, expect, it} from 'vitest';
import {getColorHex, getColorInt, NUM_COLORS} from './index';
import COLORS from './colors.json';

describe('colors utilities', () => {
  it('returns hex color and numeric value', () => {
    expect(NUM_COLORS).toBe(COLORS.length);
    expect(getColorHex(0, 'pale')).toBe(COLORS[0].pale);
    expect(getColorInt(0, 'pale')).toBe(parseInt(COLORS[0].pale.replace('#','0x')));
  });
});
