import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Position from '../../../../src/components/genome-map/position';

describe('Position', () => {
  it('renders label text', () => {
    const {getByText} = render(
      <svg>
        <Position
         offsetY={0}
         position={{name: 'p1', pos: 1, turns: [[0, 0, 1]]}}
        />
      </svg>
    );
    expect(getByText('p1')).toBeInTheDocument();
  });
});
