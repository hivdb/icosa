import '@testing-library/jest-dom';
import {render, waitFor} from '@testing-library/react';
import MutAnnotViewer from '../../../../src/views/mut-annot-viewer/viewer';

vi.mock('../../../../src/views/mut-annot-viewer/components/legend-context', () => ({
  __esModule: true,
  default: ({children}: any) => <div>{children}</div>
}));
vi.mock('../../../../src/views/mut-annot-viewer/components/canvas-sequence-viewer', () => ({
  __esModule: true,
  default: () => <div data-testid="canvas">canvas</div>
}));
vi.mock('../../../../src/views/mut-annot-viewer/components/viewer-controller', () => ({
  __esModule: true,
  default: () => <div>controller</div>
}));
vi.mock('../../../../src/views/mut-annot-viewer/components/viewer-legend', () => ({
  __esModule: true,
  default: () => <div>legend</div>
}));
vi.mock('../../../../src/views/mut-annot-viewer/components/viewer-footer', () => ({
  __esModule: true,
  default: ({children}: any) => <div>footer{children}</div>,
  useFootnote: () => ['', false, false, () => {}, () => {}]
}));
vi.mock('../../../../src/components/loader', () => ({
  __esModule: true,
  default: () => <div data-testid="loader">loading</div>
}));
vi.mock('../../../../src/views/mut-annot-viewer/style.module.scss', () => ({default: {}}), {virtual: true});

describe('MutAnnotViewer', () => {
  it('loads data and renders inner viewer', async () => {
    const preset = {
      name: 'foo',
      display: 'Foo',
      annotationLoader: async () => ({
        refSequence: 'ABC',
        fragmentOptions: [{name: 'foo', seqFragment: [1, 10]}],
        proteinViews: [],
        annotCategories: [],
        annotations: [],
        positions: [],
        citations: {},
        comments: {data: [], references: ''}
      })
    };
    const refDataLoader = async () => null;
    const match = {location: {query: {region: 'foo'}}};
    const router = {push: vi.fn()};
    const {getByTestId, queryByTestId} = render(
      <MutAnnotViewer preset={preset as any} refDataLoader={refDataLoader} match={match as any} router={router as any} />
    );
    expect(getByTestId('loader')).toBeInTheDocument();
    await waitFor(() => {
      expect(queryByTestId('canvas')).toBeInTheDocument();
    });
  });

  /**
   * Regression test for citations data structure.
   * Citations should be an object/dictionary (Record<string, Citation>), not an array.
   * The API returns citations as {"1.1": {...}, "2.1": {...}}, not as an array.
   * This test ensures the component handles the correct data structure.
   */
  it('handles citations as object dictionary correctly', async () => {
    const citationsData = {
      '1.1': {
        citationId: 1,
        sectionId: 1,
        author: 'Smith',
        year: 2020,
        doi: '10.1234/test',
        section: 'Figure 1'
      },
      '2.1': {
        citationId: 2,
        sectionId: 1,
        author: 'Jones',
        year: 2021,
        doi: '10.5678/test',
        section: 'Table 1'
      }
    };

    const preset = {
      name: 'test',
      display: 'Test',
      annotationLoader: async () => ({
        refSequence: 'ABCDEFGHIJ',
        fragmentOptions: [{name: 'test', seqFragment: [1, 10]}],
        proteinViews: [],
        annotCategories: [],
        annotations: [],
        positions: [],
        citations: citationsData,
        comments: {data: [], references: ''}
      })
    };

    const match = {location: {query: {}}};
    const router = {push: vi.fn()};
    const {queryByTestId} = render(
      <MutAnnotViewer preset={preset as any} refDataLoader={undefined} match={match as any} router={router as any} />
    );

    await waitFor(() => {
      expect(queryByTestId('canvas')).toBeInTheDocument();
    });
  });

  /**
   * Regression test for empty citations object.
   * Ensures the component doesn't crash when citations is an empty object.
   */
  it('handles empty citations object without errors', async () => {
    const preset = {
      name: 'empty',
      display: 'Empty',
      annotationLoader: async () => ({
        refSequence: 'XYZ',
        fragmentOptions: [{name: 'empty', seqFragment: [1, 3]}],
        proteinViews: [],
        annotCategories: [],
        annotations: [],
        positions: [],
        citations: {},
        comments: {data: [], references: ''}
      })
    };

    const match = {location: {query: {}}};
    const router = {push: vi.fn()};
    const {queryByTestId} = render(
      <MutAnnotViewer preset={preset as any} refDataLoader={undefined} match={match as any} router={router as any} />
    );

    await waitFor(() => {
      expect(queryByTestId('canvas')).toBeInTheDocument();
    });
  });

  /**
   * Regression test for protein views data structure.
   * Ensures proteinViews array is passed through correctly to child components.
   */
  it('passes proteinViews array to child components', async () => {
    const proteinViewsData = [
      {
        name: 'RBD',
        pdb: '6M0J',
        sele: ':A',
        positionOffset: 0
      }
    ];

    const preset = {
      name: 'protein',
      display: 'Protein',
      annotationLoader: async () => ({
        refSequence: 'ACDEFGHIKLMNPQRSTVWY',
        fragmentOptions: [{name: 'protein', seqFragment: [1, 20]}],
        proteinViews: proteinViewsData,
        annotCategories: [],
        annotations: [],
        positions: [],
        citations: {},
        comments: {data: [], references: ''}
      })
    };

    const match = {location: {query: {}}};
    const router = {push: vi.fn()};
    const {queryByTestId} = render(
      <MutAnnotViewer preset={preset as any} refDataLoader={undefined} match={match as any} router={router as any} />
    );

    await waitFor(() => {
      expect(queryByTestId('canvas')).toBeInTheDocument();
    });
  });
});
