import '@testing-library/jest-dom';
import React from 'react';
import {render} from '@testing-library/react';
import Legend from '../../../../../../src/views/mut-annot-viewer/components/viewer-legend';

vi.mock('../../../../../../src/views/mut-annot-viewer/components/viewer-legend/style.module.scss', () => ({default: {}}), {virtual: true});
vi.mock('../../../../../../src/views/mut-annot-viewer/components/viewer-legend/color-legend/style.module.scss', () => ({default: {}}), {virtual: true});

const annotCategories = [
  {name: 'cat1', annotStyle: 'colorBox'},
  {name: 'aaCat', annotStyle: 'aminoAcids', display: 'AA'}
];
const curAnnotNameLookup = {cat1: ['ann1'], aaCat: ['ann2']};
const annotations = [{name: 'ann1', level: 'position'}];
const positionLookup: any = {};
const citations: any = {};

describe('ViewerLegend', () => {
  it('renders legend header', () => {
    const {getByText} = render(
      <Legend
        seqFragment={[1, 2]}
        positionLookup={positionLookup}
        citations={citations}
        annotCategories={annotCategories as any}
        curAnnotNameLookup={curAnnotNameLookup}
        annotations={annotations as any}
      />
    );
    expect(getByText('Legend:')).toBeInTheDocument();
  });
});
