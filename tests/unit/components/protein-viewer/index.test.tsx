import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import ProteinViewer from '../../../../src/components/protein-viewer';

vi.mock('react-ngl', () => ({
  Stage: ({children}: any) => <div data-testid="stage">{children}</div>,
  StructureComponent: ({children}: any) => <div data-testid="component">{children}</div>,
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
  it('renders stage and components', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const positions = [{position: 1, label: '', desc: '', bgColor: 0, color: 0}];
    const {getByTestId} = render(<ProteinViewer views={views} positions={positions} />);
    expect(getByTestId('stage')).toBeInTheDocument();
    expect(getByTestId('component')).toBeInTheDocument();
  });
});

