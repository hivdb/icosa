import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect} from 'vitest';

import PositionGroup from './position-group';

const config = {
  posItemSizePixel: 10,
  strokeWidthPixel: 1,
  hoverTextFontSizePixel: 12,
  hoverPosNumOffsetPixel: {x: 0, y: 0},
  hoverTextColor: 'red',
  fontFamily: 'sans-serif',
  pos2Coord: () => ({x: 0, y: 0}),
  getStrokeColor: () => 'black'
};

describe('Hover PositionGroup', () => {
  it('renders provided position', () => {
    const {getByText} = render(<PositionGroup position={3} config={config} />);
    expect(getByText('3')).toBeInTheDocument();
  });
});

