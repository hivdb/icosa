import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect} from 'vitest';

import UnderscoreAnnotGroup from './underscore-annot-group';

const config = {
  canvasWidthPixel: 100,
  posItemSizePixel: 10,
  hoverUnderscoreAnnotOffsetPixel: {x: 0, y: 0},
  hoverTextFontSizePixel: 12,
  hoverTextColor: 'blue',
  fontFamily: 'sans-serif'
};

describe('Hover UnderscoreAnnotGroup', () => {
  it('renders annotation text', () => {
    const {getByText} = render(
      <UnderscoreAnnotGroup annotName="AA" x={0} y={0} config={config} />
    );
    expect(getByText('AA')).toBeInTheDocument();
  });
});

