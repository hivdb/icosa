import {renderHook, act} from '@testing-library/react';
import useHoverResidues from './use-hover-residues';
import type {ResidueAnnot} from '../types';

describe('useHoverResidues', () => {
  it('updates tooltip description on hover', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    const tooltip = document.createElement('div');
    result.current.tooltipRef.current = tooltip;
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QN'}, mouse: {position: {x: 0, y: 0}}});
    });
    expect(result.current.children).toBe('Desc1');
  });
});

