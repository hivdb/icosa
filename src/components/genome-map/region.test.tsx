import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Region from './region';
import {scaleMultipleLinears} from './helpers';

const scaleX = scaleMultipleLinears([[0, 10, 1]], [0, 100]);

describe('Region', () => {
  it('renders region label', () => {
    const {getByText} = render(
      <svg>
        <Region scaleX={scaleX} region={{name: 'r1', posStart: 1, posEnd: 5, shapeType: 'rect'}} />
      </svg>
    );
    expect(getByText('R1')).toBeInTheDocument();
  });
});
