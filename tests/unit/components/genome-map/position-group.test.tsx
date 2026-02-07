import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import PositionGroup from '../../../../src/components/genome-map/position-group';
import {scaleMultipleLinears} from '../../../../src/components/genome-map/helpers';

const scaleX = scaleMultipleLinears([[0, 10, 1]], [0, 100]);

describe('PositionGroup', () => {
  it('renders region and position', () => {
    const {getByText} = render(
      <PositionGroup
       offsetY={0}
       scaleX={scaleX}
       positionGroup={{name: 'g', positions: [{name: 'p1', pos: 2, turns: [[20,0,1]]}]}}
       regions={[{name: 'r1', posStart: 1, posEnd: 3, shapeType: 'rect'}]}
      />
    );
    expect(getByText('p1')).toBeInTheDocument();
  });
});
