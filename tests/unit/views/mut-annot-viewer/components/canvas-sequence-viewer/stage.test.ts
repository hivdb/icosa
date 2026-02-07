import {describe, expect, it} from 'vitest';
import {rangePos, unionSelections, getKeyCmd} from '../../../../../../src/views/mut-annot-viewer/components/canvas-sequence-viewer/stage';

describe('stage helpers', () => {
  it('rangePos should generate inclusive range', () => {
    expect(rangePos(3,5)).toEqual([3,4,5]);
    expect(rangePos(5,3)).toEqual([3,4,5]);
  });

  it('unionSelections should merge selections', () => {
    expect(unionSelections([1,2],[2],[3])).toEqual([1,3]);
  });

  it('getKeyCmd should detect modifiers', () => {
    expect(getKeyCmd({ctrlKey:true})).toEqual({multiSel:true, rangeSel:false});
    expect(getKeyCmd({shiftKey:true})).toEqual({multiSel:false, rangeSel:true});
    expect(getKeyCmd({ctrlKey:true, shiftKey:true})).toEqual({multiSel:false, rangeSel:false});
  });
});
