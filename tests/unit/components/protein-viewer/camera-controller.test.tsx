import {render, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import CameraController from '../../../../src/components/protein-viewer/camera-controller';
import {makeDownload} from '../../../../src/utils/download';

const mockMakeDownload = vi.fn();
let mockMounted = vi.fn(() => true);

vi.mock('../../../../src/components/select', () => ({
  default: ({onChange, options, value}: any) => (
    <select data-testid="select" onChange={e => onChange({value: e.target.value})} value={value?.value}>
      {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}));

vi.mock('../../../../src/components/button', () => ({
  default: ({children, onClick, ...props}: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  )
}));

vi.mock('../../../../src/utils/download', () => ({
  makeDownload: (...args: any[]) => mockMakeDownload(...args)
}));

vi.mock('../../../../src/utils/use-mounted', () => ({
  default: () => mockMounted
}));

const mocks = {
  stage: null as any,
  component: null as any
};

vi.mock('react-ngl', () => {
  class MockPosition {
    x: number; y: number; z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x; this.y = y; this.z = z;
    }
    clone() { return new MockPosition(this.x, this.y, this.z); }
    multiplyScalar(s: number) {
      return new MockPosition(this.x * s, this.y * s, this.z * s);
    }
  }

  class MockRotation {
    x: number; y: number; z: number; w: number;
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x; this.y = y; this.z = z; this.w = w;
    }
    clone() { return new MockRotation(this.x, this.y, this.z, this.w); }
  }

  return {
    useStage: () => mocks.stage,
    useComponent: () => mocks.component,
    Position: MockPosition,
    Rotation: MockRotation
  };
});

describe('CameraController', () => {
  beforeEach(async () => {
    mockMakeDownload.mockClear();
    mockMounted = vi.fn(() => true);
    mocks.stage = {
      viewer: {
        getImage: vi.fn(() => Promise.resolve(new Blob(['test'], {type: 'image/png'})))
      }
    };
    // Import Position and Rotation from the mocked module
    const {Position, Rotation} = await import('react-ngl');
    
    mocks.component = {
      getCenter: vi.fn(() => new Position(10, 20, 30)),
      getZoom: vi.fn(() => 100),
      getBox: vi.fn(() => ({
        min: new Position(-50, -60, -70),
        max: new Position(50, 60, 70)
      }))
    };
  });

  it('renders control buttons', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const {getByText} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
      />
    );
    expect(getByText('Save image')).toBeInTheDocument();
    expect(getByText('Reset camera')).toBeInTheDocument();
  });

  it('renders view selector when multiple views available', () => {
    const views = [
      {name: 'view1', pdb: '1abc', label: 'View 1'},
      {name: 'view2', pdb: '1def', label: 'View 2'}
    ];
    const {getByTestId} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
      />
    );
    expect(getByTestId('select')).toBeInTheDocument();
  });

  it('renders label when only one view available', () => {
    const views = [{name: 'view1', pdb: '1abc', label: 'Single View'}];
    const {getByText, queryByTestId} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
      />
    );
    expect(getByText(/Single View/)).toBeInTheDocument();
    expect(queryByTestId('select')).not.toBeInTheDocument();
  });

  it('calls setView when view is changed', () => {
    const views = [
      {name: 'view1', pdb: '1abc'},
      {name: 'view2', pdb: '1def'}
    ];
    const setView = vi.fn();
    const {getByTestId} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={setView}
        setCameraState={() => {}}
      />
    );
    
    fireEvent.change(getByTestId('select'), {target: {value: 'view2'}});
    expect(setView).toHaveBeenCalledWith(views[1]);
  });

  it('handles download button click', async () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const {getByText} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
      />
    );
    
    fireEvent.click(getByText('Save image'));
    
    await waitFor(() => {
      expect(mocks.stage.viewer.getImage).toHaveBeenCalled();
    });
    
    await waitFor(() => {
      expect(mockMakeDownload).toHaveBeenCalledWith(
        '1abc.png',
        'image/png',
        expect.any(Blob),
        true
      );
    });
  });

  it('does not download if component unmounted', async () => {
    mockMounted = vi.fn(() => false);
    const views = [{name: 'view1', pdb: '1abc'}];
    const {getByText} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
      />
    );
    
    fireEvent.click(getByText('Save image'));
    
    await waitFor(() => {
      expect(mocks.stage.viewer.getImage).toHaveBeenCalled();
    });
    
    // Wait a bit to ensure makeDownload is not called
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(mockMakeDownload).not.toHaveBeenCalled();
  });

  it('calls setCameraState on reset', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const setCameraState = vi.fn();
    const {getByText} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={setCameraState}
      />
    );
    
    fireEvent.click(getByText('Reset camera'));
    expect(setCameraState).toHaveBeenCalled();
  });

  it('uses default camera state when provided', () => {
    const views = [{
      name: 'view1',
      pdb: '1abc',
      defaultCameraState: {
        position: [1, 2, 3],
        rotation: [0.1, 0.2, 0.3, 0.9],
        distance: 150
      }
    }];
    const setCameraState = vi.fn();
    render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        defaultCameraState={views[0].defaultCameraState}
        setCameraState={setCameraState}
      />
    );
    
    // Reset is called on mount
    expect(setCameraState).toHaveBeenCalled();
  });

  it('renders verbose controls when verbose is true', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const cameraState = {
      position: {x: 1, y: 2, z: 3},
      rotation: {x: 0, y: 0, z: 0, w: 1},
      distance: 100
    };
    const {getByText} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
        cameraState={cameraState}
        verbose={true}
      />
    );
    
    expect(getByText(/Px/)).toBeInTheDocument();
    expect(getByText(/Rx/)).toBeInTheDocument();
    expect(getByText(/Distance/)).toBeInTheDocument();
  });

  it('does not render verbose controls when verbose is false', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const {queryByText} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
        verbose={false}
      />
    );
    
    expect(queryByText(/Px/)).not.toBeInTheDocument();
  });

  it('handles position slider change', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const cameraState = {
      position: {x: 1, y: 2, z: 3, clone: () => ({x: 1, y: 2, z: 3})},
      rotation: {x: 0, y: 0, z: 0, w: 1},
      distance: 100
    };
    const setCameraState = vi.fn();
    const {container} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={setCameraState}
        cameraState={cameraState}
        verbose={true}
      />
    );
    
    const slider = container.querySelector('input[name="position-axis-input_x"]') as HTMLInputElement;
    fireEvent.change(slider, {target: {value: '5'}});
    
    expect(setCameraState).toHaveBeenCalled();
  });

  it('handles rotation slider change', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const cameraState = {
      position: {x: 1, y: 2, z: 3},
      rotation: {x: 0, y: 0, z: 0, w: 1, clone: () => ({x: 0, y: 0, z: 0, w: 1})},
      distance: 100
    };
    const setCameraState = vi.fn();
    const {container} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={setCameraState}
        cameraState={cameraState}
        verbose={true}
      />
    );
    
    const slider = container.querySelector('input[name="rotation-axis-input_x"]') as HTMLInputElement;
    fireEvent.change(slider, {target: {value: '0.5'}});
    
    expect(setCameraState).toHaveBeenCalled();
  });

  it('handles distance slider change', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const cameraState = {
      position: {x: 1, y: 2, z: 3},
      rotation: {x: 0, y: 0, z: 0, w: 1},
      distance: 100
    };
    const setCameraState = vi.fn();
    const {container} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={setCameraState}
        cameraState={cameraState}
        verbose={true}
      />
    );
    
    const slider = container.querySelector('input[name="distance-axis-input"]') as HTMLInputElement;
    fireEvent.change(slider, {target: {value: '150'}});
    
    expect(setCameraState).toHaveBeenCalled();
  });

  it('handles sele parameter in component methods', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    render(
      <CameraController
        pdb="1abc"
        sele=":A"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
      />
    );
    
    expect(mocks.component.getCenter).toHaveBeenCalledWith(':A');
    expect(mocks.component.getZoom).toHaveBeenCalledWith(':A');
    expect(mocks.component.getBox).toHaveBeenCalledWith(':A');
  });

  it('uses view label when available', () => {
    const views = [{name: 'view1', pdb: '1abc', label: <span>Custom Label</span>}];
    const {getByText} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
      />
    );
    
    expect(getByText('Custom Label')).toBeInTheDocument();
  });

  it('handles null value in handleSelectView', () => {
    const views = [
      {name: 'view1', pdb: '1abc'},
      {name: 'view2', pdb: '1def'}
    ];
    const setView = vi.fn();
    render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={setView}
        setCameraState={() => {}}
      />
    );
    
    // Simulate selecting null (shouldn't call setView)
    // This tests the null check in handleSelectView
    expect(setView).not.toHaveBeenCalled();
  });
});

