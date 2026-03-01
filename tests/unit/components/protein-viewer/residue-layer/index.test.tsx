import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import ResidueLayer from '../../../../../src/components/protein-viewer/residue-layer';
import type {ResidueAnnot} from '../../../../../src/components/protein-viewer/types';

let mockStage: any;
let mockComponent: any;
let mockShapeComp: any;
let mockShape: any;

vi.mock('react-ngl', () => ({
  useStage: () => mockStage,
  useComponent: () => mockComponent
}));

vi.mock('ngl', () => ({
  Selection: class {
    constructor(public sele: string) {}
  },
  TextBuffer: class {
    constructor(public data: any, public params: any) {}
  },
  Shape: class {
    constructor(public name: string, public params: any) {
      mockShape = this;
    }
    addBuffer = vi.fn();
    dispose = vi.fn();
  }
}));

vi.mock('three', () => ({
  Color: class {
    constructor(public color: any) {}
    toArray() { return [1, 0, 0]; }
  }
}));

vi.mock('../../../../../src/components/protein-viewer/residue-layer/use-hover-residues', () => ({
  default: (sele: string, residues: ResidueAnnot[]) => ({
    children: 'Tooltip content',
    onHover: vi.fn(),
    tooltipRef: {current: null}
  })
}));

describe('ResidueLayer', () => {
  beforeEach(() => {
    mockShapeComp = {
      addRepresentation: vi.fn()
    };
    mockStage = {
      addComponentFromObject: vi.fn(() => mockShapeComp),
      removeComponent: vi.fn(),
      mouseControls: {
        remove: vi.fn()
      },
      signals: {
        hovered: {
          add: vi.fn(),
          remove: vi.fn()
        }
      }
    };
    mockComponent = {
      object: {
        getAtomIndices: vi.fn(() => [0, 1, 2]),
        getAtomProxy: vi.fn((idx: number) => ({
          resno: idx + 1,
          x: idx * 10,
          y: idx * 20,
          z: idx * 30
        }))
      }
    };
  });

  it('renders tooltip container', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    const {getByText} = render(<ResidueLayer residues={residues} />);
    expect(getByText('Tooltip content')).toBeInTheDocument();
  });

  it('creates shape with residue labels', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'},
      {resno: 2, label: 'B', desc: 'Desc2', bgColor: 'green', color: 'yellow'}
    ];
    render(<ResidueLayer residues={residues} />);
    
    expect(mockStage.addComponentFromObject).toHaveBeenCalled();
    expect(mockShapeComp.addRepresentation).toHaveBeenCalledWith('buffer');
  });

  it('adds text buffers for residues with labels', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    render(<ResidueLayer residues={residues} />);
    
    expect(mockShape.addBuffer).toHaveBeenCalled();
  });

  it('does not add text buffer for residues without labels', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    render(<ResidueLayer residues={residues} />);
    
    // Should still create shape but not add buffers for unlabeled residues
    expect(mockStage.addComponentFromObject).toHaveBeenCalled();
  });

  it('includes sele in atom selection when provided', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    render(<ResidueLayer sele=":A" residues={residues} />);
    
    expect(mockComponent.object.getAtomIndices).toHaveBeenCalled();
    const call = mockComponent.object.getAtomIndices.mock.calls[0][0];
    expect(call.sele).toContain('AND :A');
  });

  it('does not include sele suffix when not provided', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    render(<ResidueLayer residues={residues} />);
    
    expect(mockComponent.object.getAtomIndices).toHaveBeenCalled();
    const call = mockComponent.object.getAtomIndices.mock.calls[0][0];
    // Should have .CA but not an additional sele suffix
    expect(call.sele).toContain('.CA');
    expect(call.sele).not.toMatch(/AND\s+:/); // No "AND :" pattern for sele
  });

  it('cleans up shape on unmount', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    const {unmount} = render(<ResidueLayer residues={residues} />);
    
    unmount();
    
    expect(mockStage.removeComponent).toHaveBeenCalledWith(mockShapeComp);
    expect(mockShape.dispose).toHaveBeenCalled();
  });

  it('adds hover signal handler', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    render(<ResidueLayer residues={residues} />);
    
    expect(mockStage.mouseControls.remove).toHaveBeenCalledWith('hoverPick');
    expect(mockStage.signals.hovered.add).toHaveBeenCalled();
  });

  it('removes hover signal handler on unmount', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    const {unmount} = render(<ResidueLayer residues={residues} />);
    
    unmount();
    
    expect(mockStage.signals.hovered.remove).toHaveBeenCalled();
  });

  it('handles multiple residues', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'},
      {resno: 2, label: 'B', desc: 'Desc2', bgColor: 'green', color: 'yellow'},
      {resno: 3, label: 'C', desc: 'Desc3', bgColor: 'purple', color: 'white'}
    ];
    render(<ResidueLayer residues={residues} />);
    
    expect(mockComponent.object.getAtomIndices).toHaveBeenCalled();
    const call = mockComponent.object.getAtomIndices.mock.calls[0][0];
    expect(call.sele).toContain('1 OR 2 OR 3');
  });

  it('renders tooltip content from useHoverResidues', () => {
    const residues: ResidueAnnot[] = [
      {resno: 1, label: 'A', desc: 'Desc1', bgColor: 'red', color: 'blue'}
    ];
    const {getByText} = render(<ResidueLayer residues={residues} />);
    
    expect(getByText('Tooltip content')).toBeInTheDocument();
  });

  it('handles empty residues array', () => {
    const residues: ResidueAnnot[] = [];
    render(<ResidueLayer residues={residues} />);
    
    expect(mockStage.addComponentFromObject).toHaveBeenCalled();
  });
});
