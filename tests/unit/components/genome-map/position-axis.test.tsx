import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import PositionAxis from '../../../../src/components/genome-map/position-axis';
import {createTestScale} from './test-utils';

const scaleX = createTestScale([[0, 30, 1]], [0, 300]);

describe('PositionAxis', () => {
  it('renders tick labels', () => {
    const {getByText} = render(
      <PositionAxis offsetY={0} scaleX={scaleX} />
    );
    expect(getByText('0')).toBeInTheDocument();
  });

  it('renders with convertToAA option', () => {
    const {container} = render(
      <PositionAxis
        offsetY={0}
        scaleX={scaleX}
        positionAxis={{convertToAA: true, posOffset: 0, tickCount: 10, roundToNearest: 3}}
      />
    );
    expect(container.querySelector('#position-axis')).toBeInTheDocument();
  });

  it('renders with multiple regions requiring path extensions', () => {
    const multiRegionScale = createTestScale([[0, 10, 1], [20, 30, 1]], [0, 300]);
    const {container} = render(
      <PositionAxis
        offsetY={0}
        scaleX={multiRegionScale}
        positionAxis={{posOffset: 0, tickCount: 15, roundToNearest: 1}}
      />
    );
    expect(container.querySelector('#position-axis')).toBeInTheDocument();
  });

  it('handles edge case where last tick is close to end', () => {
    const {container} = render(
      <PositionAxis
        offsetY={0}
        scaleX={scaleX}
        positionAxis={{posOffset: 5, tickCount: 20, roundToNearest: 1}}
      />
    );
    expect(container.querySelector('#position-axis')).toBeInTheDocument();
  });

  it('handles domains with positions extending beyond global range', () => {
    // Create a scale with multiple domains where some positions extend beyond global bounds
    const multiScale = createTestScale([[0, 5, 1], [10, 15, 1], [20, 25, 1]], [0, 300]);
    const {container} = render(
      <PositionAxis
        offsetY={0}
        scaleX={multiScale}
        positionAxis={{posOffset: 0, tickCount: 10, roundToNearest: 1}}
      />
    );
    expect(container.querySelector('#position-axis')).toBeInTheDocument();
  });
});
