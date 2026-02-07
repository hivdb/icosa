import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import BufferShape from '../../../../src/components/protein-viewer/buffer-shape';

vi.mock('react-ngl', () => ({
  useStage: () => ({
    addComponentFromObject: () => ({addRepresentation: () => {}}),
    removeComponent: () => {}
  })
}));
vi.mock('ngl', () => ({Shape: class {dispose(){} addBuffer(){}}}));

describe('BufferShape', () => {
  it('renders children', () => {
    const {getByText} = render(<BufferShape><span>Hello</span></BufferShape>);
    expect(getByText('Hello')).toBeInTheDocument();
  });
});

