import {describe, it, expect} from 'vitest';

import {getLongestPosLabelHeight, scaleMultipleLinears, trimOverlaps} from '../../../../src/components/genome-map/helpers';
import type {PositionGroup} from '../../../../src/components/genome-map/types';

describe('genome-map helpers', () => {
  it('calculates longest label height', () => {
    const height = getLongestPosLabelHeight([
      {name: 'A', pos: 1},
      {name: 'B', label: 'LONG', pos: 2}
    ]);
    expect(height).toBeGreaterThan(0);
  });

  it('scales multiple domains', () => {
    const scale = scaleMultipleLinears([[0, 10, 1]], [0, 100]);
    expect(scale(5)).toBe(50);
    expect(scale.domain()).toEqual([0, 10]);
  });

  it('trims overlaps', () => {
    const group: PositionGroup = {
      name: 'g',
      positions: [
        {name: 'p1', pos: 1},
        {name: 'p2', pos: 2}
      ]
    };
    const scale = scaleMultipleLinears([[0, 10, 1]], [0, 100]);
    const trimmed = trimOverlaps(group, scale);
    expect(trimmed.positions.length).toBe(2);
    expect(trimmed.addOffsetY).toBeGreaterThanOrEqual(0);
  });

  it('trims overlaps with close positions requiring turns', () => {
    // Test positions that are very close together, triggering the shouldTurn logic
    const group: PositionGroup = {
      name: 'g',
      positions: [
        {name: 'p1', pos: 5},
        {name: 'p2', pos: 5.1}, // Very close to p1
        {name: 'p3', pos: 5.2}  // Very close to p2
      ]
    };
    const scale = scaleMultipleLinears([[0, 10, 1]], [0, 100]);
    const trimmed = trimOverlaps(group, scale);
    expect(trimmed.positions.length).toBe(3);
    // Verify that turns were added to prevent overlap
    expect(trimmed.positions.some(p => p.turns && p.turns.length > 1)).toBe(true);
  });

  it('returns NaN for position outside all scale domains', () => {
    const scale = scaleMultipleLinears([[0, 10, 1], [20, 30, 1]], [0, 100]);
    // Position 15 is between the two domains (gap from 10 to 20)
    expect(scale(15)).toBeNaN();
  });

  it('returns undefined for invert with x outside all ranges', () => {
    const scale = scaleMultipleLinears([[0, 10, 1]], [0, 100]);
    // x value beyond the range
    expect(scale.invert(150)).toBeUndefined();
  });

  it('trims overlaps with positions requiring offsetY adjustments', () => {
    // Test with many overlapping positions to trigger offsetY calculation in reverse loop
    const group: PositionGroup = {
      name: 'g',
      positions: [
        {name: 'p1', pos: 1},
        {name: 'p2', pos: 1.05},
        {name: 'p3', pos: 1.1},
        {name: 'p4', pos: 1.15},
        {name: 'p5', pos: 1.2},
        {name: 'p6', pos: 1.25}
      ]
    };
    const scale = scaleMultipleLinears([[0, 10, 1]], [0, 100]);
    const trimmed = trimOverlaps(group, scale);
    expect(trimmed.positions.length).toBeGreaterThan(0);
    expect(trimmed.addOffsetY).toBeGreaterThan(0);
  });
});
