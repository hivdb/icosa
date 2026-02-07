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
});
