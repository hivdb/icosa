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
        fragmentOptions: [{name: 'foo', seqFragment: [1]}],
        proteinViews: [],
        annotCategories: [],
        annotations: [],
        positions: [],
        citations: [],
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
});
