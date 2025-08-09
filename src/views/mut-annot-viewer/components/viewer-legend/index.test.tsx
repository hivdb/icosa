import '@testing-library/jest-dom';
import React from 'react';
import {render} from '@testing-library/react';
import LegendContext from '../legend-context';
import Legend from './index';

vi.mock('./style.module.scss', () => ({default: {}}), {virtual: true});
vi.mock('./color-legend/style.module.scss', () => ({default: {}}), {virtual: true});

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
      <LegendContext>
        <Legend
          seqFragment={[1, 2]}
          positionLookup={positionLookup}
          citations={citations}
          annotCategories={annotCategories as any}
          curAnnotNameLookup={curAnnotNameLookup}
          annotations={annotations as any}
        />
      </LegendContext>
    );
    expect(getByText('Legend:')).toBeInTheDocument();
  });
});
