import {render} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import {describe, it, expect, vi} from 'vitest';
import BufferShape, {useBufferShape} from '../../../../src/components/protein-viewer/buffer-shape';

let mockShapeComp = {addRepresentation: vi.fn()};
let mockStage = {
  addComponentFromObject: vi.fn(() => mockShapeComp),
  removeComponent: vi.fn()
};

vi.mock('react-ngl', () => ({
  useStage: () => mockStage
}));

let mockShape: any;
vi.mock('ngl', () => ({
  Shape: class {
    name: string;
    params: any;
    constructor(name: string, params: any) {
      mockShape = this;
      this.name = name;
      this.params = params;
    }
    dispose = vi.fn();
    addBuffer = vi.fn();
  }
}));

describe('BufferShape', () => {
  beforeEach(() => {
    mockShapeComp = {addRepresentation: vi.fn()};
    mockStage = {
      addComponentFromObject: vi.fn(() => mockShapeComp),
      removeComponent: vi.fn()
    };
  });

  it('renders children', () => {
    const {getByText} = render(<BufferShape><span>Hello</span></BufferShape>);
    expect(getByText('Hello')).toBeInTheDocument();
  });

  it('creates shape with correct parameters', () => {
    render(<BufferShape><span>Test</span></BufferShape>);
    expect(mockShape.name).toBe('buffer-shape');
    expect(mockShape.params).toEqual({
      sphereDetail: 4,
      radialSegments: 100
    });
  });

  it('adds shape component to stage', () => {
    render(<BufferShape><span>Test</span></BufferShape>);
    expect(mockStage.addComponentFromObject).toHaveBeenCalledWith(mockShape);
    expect(mockShapeComp.addRepresentation).toHaveBeenCalledWith('buffer');
  });

  it('provides shape via useBufferShape hook', () => {
    let capturedShape: any;
    function TestChild() {
      capturedShape = useBufferShape();
      return <div>Child</div>;
    }
    
    render(<BufferShape><TestChild /></BufferShape>);
    expect(capturedShape).toBe(mockShape);
  });

  it('cleans up shape on unmount', () => {
    const {unmount} = render(<BufferShape><span>Test</span></BufferShape>);
    unmount();
    expect(mockStage.removeComponent).toHaveBeenCalledWith(mockShapeComp);
    expect(mockShape.dispose).toHaveBeenCalled();
  });

  it('returns undefined from useBufferShape when not inside BufferShape', () => {
    let capturedShape: any;
    function TestComponent() {
      capturedShape = useBufferShape();
      return <div>Test</div>;
    }
    
    render(<TestComponent />);
    expect(capturedShape).toBeUndefined();
  });
});

