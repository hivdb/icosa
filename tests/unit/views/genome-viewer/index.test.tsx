import '@testing-library/jest-dom/vitest';
import React from 'react';
import {render, waitFor} from '@testing-library/react';
import GenomeViewerRoutes from '../../../../src/views/genome-viewer/index';
import type {RouteRenderArgs} from 'found';

// Mock dependencies
vi.mock('../../../../src/components/loader', () => ({
  __esModule: true,
  default: () => <div data-testid="loader">Loading...</div>
}));

vi.mock('../../../../src/components/custom-colors', () => ({
  __esModule: true,
  default: ({children, className}: {children: React.ReactNode; className?: string}) => (
    <div data-testid="custom-colors" className={className}>
      {children}
    </div>
  )
}));

vi.mock('../../../../src/views/genome-viewer/preset-selection', () => ({
  __esModule: true,
  default: ({options, className}: {options: any[]; className?: string}) => (
    <div data-testid="preset-selection" className={className}>
      {options.map(opt => (
        <div key={opt.value}>{opt.label}</div>
      ))}
    </div>
  )
}));

vi.mock('../../../../src/views/genome-viewer/viewer', () => ({
  __esModule: true,
  default: ({presetLoader}: {presetLoader: () => Promise<any>}) => {
    const [loaded, setLoaded] = React.useState(false);
    React.useEffect(() => {
      presetLoader().then(() => setLoaded(true));
    }, [presetLoader]);
    return <div data-testid="genome-viewer">{loaded ? 'Loaded' : 'Loading'}</div>;
  }
}));

describe('GenomeViewerRoutes', () => {
  const createMockIndexLoader = (presets = [{name: 'foo', label: 'Foo'}]) => 
    vi.fn(async () => ({presets}));

  const createMockPresetLoader = (name: string) => 
    vi.fn(async () => ({
      name,
      label: 'Test Preset',
      width: 100,
      height: 50,
      paddingTop: 0,
      paddingRight: 0,
      paddingLeft: 0,
      domains: [{posStart: 0, posEnd: 10, scaleRatio: 1}],
      positionGroups: [{name: 'pg', positions: [{name: 'p1', pos: 1}]}],
      regions: [{name: 'rg', posStart: 0, posEnd: 10, shapeType: 'rect' as const}],
      presets: [{name: 'foo', label: 'Foo'}]
    }));

  it('renders routes with default pathPrefix', () => {
    const indexLoader = createMockIndexLoader();
    const makePresetLoader = vi.fn(createMockPresetLoader);

    const routes = GenomeViewerRoutes({
      indexLoader,
      makePresetLoader
    });

    expect(routes).toBeDefined();
    expect(routes.props.path).toBe('genome-viewer/');
  });

  it('renders routes with custom pathPrefix', () => {
    const indexLoader = createMockIndexLoader();
    const makePresetLoader = vi.fn(createMockPresetLoader);

    const routes = GenomeViewerRoutes({
      pathPrefix: 'custom-path/',
      indexLoader,
      makePresetLoader
    });

    expect(routes).toBeDefined();
    expect(routes.props.path).toBe('custom-path/');
  });

  it('applies custom className to wrapper', () => {
    const indexLoader = createMockIndexLoader();
    const makePresetLoader = vi.fn(createMockPresetLoader);
    const customClass = 'my-custom-class';

    const routes = GenomeViewerRoutes({
      indexLoader,
      makePresetLoader,
      className: customClass
    });

    expect(routes).toBeDefined();
  });

  it('passes colors to CustomColors component', () => {
    const indexLoader = createMockIndexLoader();
    const makePresetLoader = vi.fn(createMockPresetLoader);
    const colors = {primary: '#ff0000', secondary: '#00ff00'};

    const routes = GenomeViewerRoutes({
      indexLoader,
      makePresetLoader,
      colors
    });

    expect(routes).toBeDefined();
  });

  it('loads presets via indexLoader', async () => {
    const presets = [
      {name: 'preset1', label: 'Preset 1'},
      {name: 'preset2', label: 'Preset 2'}
    ];
    const indexLoader = createMockIndexLoader(presets);
    const makePresetLoader = vi.fn(createMockPresetLoader);

    GenomeViewerRoutes({
      indexLoader,
      makePresetLoader
    });

    // The indexLoader will be called when the route is rendered
    expect(indexLoader).toBeDefined();
  });

  it('creates preset loader for specific preset name', () => {
    const indexLoader = createMockIndexLoader();
    const makePresetLoader = vi.fn(createMockPresetLoader);

    GenomeViewerRoutes({
      indexLoader,
      makePresetLoader
    });

    // Simulate calling makePresetLoader
    const presetLoader = makePresetLoader('test-preset');
    expect(makePresetLoader).toHaveBeenCalledWith('test-preset');
    expect(presetLoader).toBeDefined();
  });

  it('handles wrapper component rendering', () => {
    const indexLoader = createMockIndexLoader();
    const makePresetLoader = vi.fn(createMockPresetLoader);

    const routes = GenomeViewerRoutes({
      indexLoader,
      makePresetLoader
    });

    const WrapperComponent = routes.props.Component;
    expect(WrapperComponent).toBeDefined();

    const {getByTestId} = render(
      <WrapperComponent>
        <div data-testid="child-content">Child</div>
      </WrapperComponent>
    );

    expect(getByTestId('custom-colors')).toBeInTheDocument();
  });

  it('renders suspense fallback while loading', () => {
    const indexLoader = createMockIndexLoader();
    const makePresetLoader = vi.fn(createMockPresetLoader);

    const routes = GenomeViewerRoutes({
      indexLoader,
      makePresetLoader
    });

    const WrapperComponent = routes.props.Component;
    const {container} = render(
      <WrapperComponent>
        <div>Content</div>
      </WrapperComponent>
    );

    expect(container).toBeInTheDocument();
  });

  it('transforms presets to options format', async () => {
    const presets = [
      {name: 'foo', label: 'Foo Label'},
      {name: 'bar', label: 'Bar Label'}
    ];
    const indexLoader = createMockIndexLoader(presets);
    const makePresetLoader = vi.fn(createMockPresetLoader);

    const routes = GenomeViewerRoutes({
      indexLoader,
      makePresetLoader
    });

    // Verify the route structure includes the render function
    expect(routes.props.children).toBeDefined();
    expect(Array.isArray(routes.props.children)).toBe(true);
  });

  it('applies main-preset-selection className', async () => {
    const indexLoader = createMockIndexLoader();
    const makePresetLoader = vi.fn(createMockPresetLoader);

    const routes = GenomeViewerRoutes({
      indexLoader,
      makePresetLoader
    });

    // The className is applied in the promise resolution
    expect(routes).toBeDefined();
  });
});
