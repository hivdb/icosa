import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ProteinViewer from '../../../../src/components/protein-viewer';

let capturedReprList: any[] = [];

vi.mock('react-ngl', () => ({
  Stage: ({children}: any) => <div data-testid="stage">{children}</div>,
  StructureComponent: ({children, reprList}: any) => {
    capturedReprList = reprList;
    return <div data-testid="component">{children}</div>;
  },
  useStage: () => ({addComponentFromObject: () => ({addRepresentation: () => {},}), removeComponent: () => {}}),
  useComponent: () => ({
    getCenter: () => ({multiplyScalar: () => ({})}),
    getZoom: () => 0,
    getBox: () => ({min: {multiplyScalar: () => ({})}, max: {multiplyScalar: () => ({})}}),
    object: {getAtomIndices: () => [], getAtomProxy: () => ({})}
  }),
  Position: class {},
  Rotation: class {}
}));
vi.mock('ngl', () => ({ColormakerRegistry: {addScheme: () => 'scheme'}, Shape: class {}}));
vi.mock('../../../../src/utils/colors', () => ({getColorInt: () => 0}));
vi.mock('../../../../src/components/protein-viewer/residue-layer', () => ({default: () => <div data-testid="residue-layer"/>}));
vi.mock('../../../../src/components/protein-viewer/camera-controller', () => ({default: () => <div data-testid="camera-controller"/>}));

describe('ProteinViewer', () => {
  beforeEach(() => {
    capturedReprList = [];
  });

  it('renders stage and components', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const positions = [{position: 1, label: '', desc: '', bgColor: 0, color: 0}];
    const {getByTestId} = render(<ProteinViewer views={views} positions={positions} />);
    expect(getByTestId('stage')).toBeInTheDocument();
    expect(getByTestId('component')).toBeInTheDocument();
  });

  /**
   * Regression test for blank viewer bug.
   * When sele is undefined, the tube representation should receive undefined,
   * not an empty string. Empty string causes NGL to show nothing.
   */
  it('passes undefined sele to tube representation when view has no sele', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const positions: any[] = [];
    render(<ProteinViewer views={views} positions={positions} />);
    
    expect(capturedReprList).toHaveLength(1);
    const tubeRepr = capturedReprList[0];
    expect(tubeRepr.type).toBe('tube');
    expect(tubeRepr.params.sele).toBeUndefined();
  });

  /**
   * Regression test for blank viewer bug.
   * When sele is provided, it should be passed through correctly.
   */
  it('passes sele string to tube representation when view has sele', () => {
    const views = [{name: 'view1', pdb: '1abc', sele: ':A'}];
    const positions: any[] = [];
    render(<ProteinViewer views={views} positions={positions} />);
    
    expect(capturedReprList).toHaveLength(1);
    const tubeRepr = capturedReprList[0];
    expect(tubeRepr.type).toBe('tube');
    expect(tubeRepr.params.sele).toBe(':A');
  });

  /**
   * Test that spacefill representation is added when positions are provided.
   */
  it('adds spacefill representation when positions are provided', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const positions = [{position: 1, label: 'A1', desc: '', bgColor: 0xff0000, color: 0xffffff}];
    render(<ProteinViewer views={views} positions={positions} />);
    
    expect(capturedReprList).toHaveLength(2);
    expect(capturedReprList[0].type).toBe('tube');
    expect(capturedReprList[1].type).toBe('spacefill');
  });

  /**
   * Test that spacefill representation correctly uses sele when provided.
   */
  it('includes sele in spacefill representation when view has sele', () => {
    const views = [{name: 'view1', pdb: '1abc', sele: ':A'}];
    const positions = [{position: 1, label: 'A1', desc: '', bgColor: 0xff0000, color: 0xffffff}];
    render(<ProteinViewer views={views} positions={positions} />);
    
    expect(capturedReprList).toHaveLength(2);
    const spacefillRepr = capturedReprList[1];
    expect(spacefillRepr.type).toBe('spacefill');
    expect(spacefillRepr.params.sele).toContain('AND :A');
  });
});

