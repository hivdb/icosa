import {describe, it, expect} from 'vitest';
import {getRowKey, displayFold} from './funcs';

describe('susc-summary funcs', () => {
  it('builds key from variant', () => {
    expect(getRowKey({variant: {name: 'Alpha'}, mutations: []} as any)).toBe('Alpha');
  });

  it('builds key with vaccine name', () => {
    const key = getRowKey({mutations: [{text: 'A1B'}] as any, vaccineName: 'Pfizer'} as any);
    expect(key).toBe('A1B__Pfizer');
  });

  it('formats fold correctly', () => {
    expect(displayFold(1.23)).toBe('1.2');
    expect(displayFold(12)).toBe('12');
    expect(displayFold(1500)).toBe('≥1,000');
  });
});

