import React from 'react';
import {render} from '@testing-library/react';
import GenomeMapNodeWrapper from './macro-genome-map';

// Mock GenomeMap component
vi.mock('../genome-map', () => ({
  __esModule: true,
  default: ({preset}: any) => <div data-testid="genome-map">{preset.name}</div>
}));

describe('GenomeMapNodeWrapper', () => {
  it('renders genome map when preset exists', () => {
    const Wrapper = GenomeMapNodeWrapper({genomeMaps: {foo: {name: 'foo'}}});
    const {getByTestId} = render(<Wrapper mapName="foo" props={{}} />);
    expect(getByTestId('genome-map').textContent).toBe('foo');
  });

  it('renders error when preset missing', () => {
    const Wrapper = GenomeMapNodeWrapper({genomeMaps: {}});
    const {getByText} = render(<Wrapper mapName="bar" props={{}} />);
    expect(getByText(/genome-map data of bar is not found/i)).toBeTruthy();
  });
});
