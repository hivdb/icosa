import '@testing-library/jest-dom';
import React from 'react';
import {render, waitFor} from '@testing-library/react';
import RouterContext from 'found/RouterContext';
import GenomeViewer from '../../../../src/views/genome-viewer/viewer';
import type {Preset} from '../../../../src/views/genome-viewer/components/genome-map/types';

vi.mock('../../../../src/components/genome-map', () => ({
  __esModule: true,
  default: () => <svg data-testid="genome-map" />
}));

describe('GenomeViewerLoader', () => {
  it('renders genome map after loading preset', async () => {
    const presetLoader = vi.fn(async (): Promise<
      Preset & {presets: {name: string; label: React.ReactNode}[]}
    > => ({
      presets: [{name: 'foo', label: 'Foo'}],
      name: 'foo',
      label: 'Foo',
      width: 100,
      height: 50,
      paddingTop: 0,
      paddingRight: 0,
      paddingLeft: 0,
      domains: [{posStart: 0, posEnd: 10, scaleRatio: 1}],
      positionGroups: [{name: 'pg', positions: [{name: 'p1', pos: 1}]}],
      regions: [
        {name: 'rg', posStart: 0, posEnd: 10, shapeType: 'rect' as const}
      ]
    }));

    const context = {router: {push: vi.fn()}, match: {location: {pathname: '/genome-viewer/foo/'}}};
    const {container} = render(
      <RouterContext.Provider value={context}>
        <GenomeViewer presetLoader={presetLoader} />
      </RouterContext.Provider>
    );

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});

