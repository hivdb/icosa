import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import PositionAxis from './position-axis';
import {scaleMultipleLinears} from './helpers';

const scaleX = scaleMultipleLinears([[0, 30, 1]], [0, 300]);

describe('PositionAxis', () => {
  it('renders tick labels', () => {
    const {getByText} = render(
      <PositionAxis offsetY={0} scaleX={scaleX} />
    );
    expect(getByText('0')).toBeInTheDocument();
  });
});
