import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import RegionGroup from './region-group';
import {scaleMultipleLinears} from './helpers';

const scaleX = scaleMultipleLinears([[0, 10, 1]], [0, 100]);

describe('RegionGroup', () => {
  it('renders position groups', () => {
    const {getByText} = render(
      <svg>
        <RegionGroup
         scaleX={scaleX}
         paddingTop={0}
         positionGroups={[{name: 'g', positions: [{name: 'p1', pos: 2, turns: [[20,0,1]]}]}]}
         hidePositionAxis={false}
         positionAxisHeight={25}
         regions={[{name: 'r1', posStart: 1, posEnd: 3, shapeType: 'rect'}]}
        />
      </svg>
    );
    expect(getByText('p1')).toBeInTheDocument();
  });
});
