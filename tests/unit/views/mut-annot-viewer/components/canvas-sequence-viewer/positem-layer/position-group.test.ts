import {describe, expect, it} from 'vitest';
import {getDisplayAA} from '../../../../../../../src/views/mut-annot-viewer/components/canvas-sequence-viewer/positem-layer/position-group';

describe('getDisplayAA', () => {
  it('converts insertion and deletion codes', () => {
    expect(getDisplayAA('i')).toBe('ins');
    expect(getDisplayAA('d')).toBe('del');
    expect(getDisplayAA('A')).toBe('A');
  });
});
