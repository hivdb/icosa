import '@testing-library/jest-dom';
import React from 'react';
import {render} from '@testing-library/react';
import ViewerController from '../../../../../../src/views/mut-annot-viewer/components/viewer-controller';

vi.mock('../../../../../../src/views/mut-annot-viewer/components/viewer-controller/style.module.scss', () => ({default: {}}), {virtual: true});
vi.mock('../../../../../../src/views/mut-annot-viewer/components/viewer-controller/size-controller/style.module.scss', () => ({default: {}}), {virtual: true});
vi.mock('../../../../../../src/views/mut-annot-viewer/components/viewer-controller/fragment-dropdown/style.module.scss', () => ({default: {}}), {virtual: true});
vi.mock('../../../../../../src/views/mut-annot-viewer/components/viewer-controller/footnote-opener/style.module.scss', () => ({default: {}}), {virtual: true});
vi.mock('../../../../../../src/views/mut-annot-viewer/components/viewer-controller/annot-category/style.module.scss', () => ({default: {}}), {virtual: true});

const fragmentOptions = [{name: 'frag', seqFragment: [1, 1]}];
const annotCategories: any = [{name: 'cat', annotStyle: 'colorBox', dropdown: true, display: 'Cat'}];
const curAnnotNameLookup = {cat: ['ann1']};
const annotations: any = [{name: 'ann1', category: 'cat', level: 'position'}];

describe('ViewerController', () => {
  it('renders size controller', () => {
    const {getByText} = render(
      <ViewerController
        fragmentOptions={fragmentOptions}
        seqFragment={[1, 1]}
        annotCategories={annotCategories}
        curAnnotNameLookup={curAnnotNameLookup}
        annotations={annotations}
        seqViewerSize="large"
        hasFootnote={false}
        onCurAnnotNameLookupChange={() => {}}
        onSeqFragmentChange={() => {}}
        onSeqViewerSizeChange={() => {}}
        onOpenFootnote={() => {}}
      />
    );
    expect(getByText('Viewer size:')).toBeInTheDocument();
  });
});
