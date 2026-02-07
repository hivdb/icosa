import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import GenomeMap from '../../../../src/components/genome-map';
import type {Preset} from '../../../../src/components/genome-map/types';

vi.mock('../../../../src/components/markdown', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <div>{children}</div>
}));

const preset: Preset = {
  name: 'test',
  label: 'Test',
  width: 200,
  height: 100,
  paddingTop: 0,
  paddingLeft: 0,
  paddingRight: 0,
  domains: [{posStart: 0, posEnd: 10, scaleRatio: 1}],
  hidePositionAxis: false,
  positionAxis: {posOffset: 0, tickCount: 5, roundToNearest: 1},
  positionGroups: [
    {name: 'g', positions: [{name: 'p1', pos: 2}]}
  ],
  regions: [{name: 'r1', posStart: 0, posEnd: 3, shapeType: 'rect'}],
  positionExtendSize: 10
};

describe('GenomeMap', () => {
  it('renders svg', () => {
    const {container} = render(<GenomeMap preset={preset} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
