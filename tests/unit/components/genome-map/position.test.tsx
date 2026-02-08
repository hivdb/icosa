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

  it('renders position with arrows', () => {
    const {container} = render(
      <svg>
        <Position
         offsetY={0}
         position={{
           name: 'p1',
           pos: 1,
           turns: [[50, 0, 1]],
           arrows: ['#ff0000', '#00ff00']
         }}
        />
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(1); // Main path + arrow paths
  });

  it('renders position with custom styling', () => {
    const {getByText} = render(
      <svg>
        <Position
         offsetY={10}
         position={{
           name: 'p1',
           pos: 1,
           turns: [[50, 0, 1]],
           color: '#ff0000',
           fontWeight: 'bold',
           stroke: '#0000ff',
           strokeWidth: 2
         }}
        />
      </svg>
    );
    expect(getByText('p1')).toBeInTheDocument();
  });
});
