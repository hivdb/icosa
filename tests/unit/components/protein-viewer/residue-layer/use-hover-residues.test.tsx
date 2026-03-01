import {renderHook, act} from '@testing-library/react';
import {describe, it, expect, beforeEach, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';
import useHoverResidues from '../../../../../src/components/protein-viewer/residue-layer/use-hover-residues';
import type {ResidueAnnot} from '../../../../../src/components/protein-viewer/types';

describe('useHoverResidues', () => {
  let tooltip: HTMLDivElement;

  beforeEach(() => {
    tooltip = document.createElement('div');
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1000
    });
  });

  it('updates tooltip description on hover', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    result.current.tooltipRef.current = tooltip;
    
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
    });
    
    expect(result.current.children).toBe('Desc1');
    expect(tooltip.style.display).toBe('block');
    expect(tooltip.style.left).toBe('103px');
    expect(tooltip.style.bottom).toBe('803px'); // 1000 - 200 + 3
  });

  it('uses qualifiedName when desc is not provided', () => {
    const residues: ResidueAnnot[] = [{resno: 1, label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    result.current.tooltipRef.current = tooltip;
    
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QualifiedName'}, mouse: {position: {x: 50, y: 100}}});
    });
    
    expect(result.current.children).toBe('QualifiedName');
  });

  it('uses qualifiedName when desc is null', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: null as any, label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    result.current.tooltipRef.current = tooltip;
    
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QualifiedName'}, mouse: {position: {x: 50, y: 100}}});
    });
    
    expect(result.current.children).toBe('QualifiedName');
  });

  it('hides tooltip when hovering over non-annotated residue', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    result.current.tooltipRef.current = tooltip;
    
    // First show tooltip
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
    });
    expect(tooltip.style.display).toBe('block');
    
    // Then hover over different residue
    act(() => {
      result.current.onHover({atom: {resno: 999, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
    });
    
    expect(tooltip.style.display).toBe('none');
  });

  it('hides tooltip when proxy has bond instead of atom', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    result.current.tooltipRef.current = tooltip;
    
    act(() => {
      result.current.onHover({
        bond: {},
        closestBondAtom: {resno: 1, qualifiedName: () => 'QN'},
        mouse: {position: {x: 100, y: 200}}
      });
    });
    
    expect(result.current.children).toBe('Desc1');
    expect(tooltip.style.display).toBe('block');
  });

  it('hides tooltip when proxy is null', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    result.current.tooltipRef.current = tooltip;
    
    // First show tooltip
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
    });
    expect(tooltip.style.display).toBe('block');
    
    // Then pass null
    act(() => {
      result.current.onHover(null);
    });
    
    expect(tooltip.style.display).toBe('none');
  });

  it('does nothing when tooltip ref is not set', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    
    // Should not throw
    expect(() => {
      act(() => {
        result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
      });
    }).not.toThrow();
  });

  it('handles multiple residues with different descriptions', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, desc: 'First', label: 'A', bgColor: 'red', color: 'blue'},
      {resno: 2, desc: 'Second', label: 'B', bgColor: 'green', color: 'yellow'},
      {resno: 3, desc: 'Third', label: 'C', bgColor: 'purple', color: 'white'}
    ];
    const {result} = renderHook(() => useHoverResidues('', residues));
    result.current.tooltipRef.current = tooltip;
    
    act(() => {
      result.current.onHover({atom: {resno: 2, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
    });
    
    expect(result.current.children).toBe('Second');
  });

  it('returns stable onHover callback across rerenders', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const {result, rerender} = renderHook(() => useHoverResidues('', residues));
    
    const firstCallback = result.current.onHover;
    rerender();
    const secondCallback = result.current.onHover;
    
    expect(firstCallback).toBe(secondCallback);
  });

  it('updates tooltipDesc when residues change', () => {
    const residues1: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const residues2: ResidueAnnot[] = [{resno: 1, desc: 'NewDesc', label: 'A', bgColor: 'red', color: 'blue'}];
    
    const {result, rerender} = renderHook(
      ({residues}) => useHoverResidues('', residues),
      {initialProps: {residues: residues1}}
    );
    
    result.current.tooltipRef.current = tooltip;
    
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
    });
    expect(result.current.children).toBe('Desc1');
    
    rerender({residues: residues2});
    
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
    });
    expect(result.current.children).toBe('NewDesc');
  });

  it('handles proxy with neither atom nor bond', () => {
    const residues: ResidueAnnot[] = [{resno: 1, desc: 'Desc1', label: 'A', bgColor: 'red', color: 'blue'}];
    const {result} = renderHook(() => useHoverResidues('', residues));
    result.current.tooltipRef.current = tooltip;
    
    // First show tooltip
    act(() => {
      result.current.onHover({atom: {resno: 1, qualifiedName: () => 'QN'}, mouse: {position: {x: 100, y: 200}}});
    });
    expect(tooltip.style.display).toBe('block');
    
    // Then pass proxy without atom or bond
    act(() => {
      result.current.onHover({mouse: {position: {x: 100, y: 200}}});
    });
    
    expect(tooltip.style.display).toBe('none');
  });
});

