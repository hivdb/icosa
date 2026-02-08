import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Region from '../../../../src/components/genome-map/region';
import {createTestScale} from './test-utils';

const scaleX = createTestScale([[0, 10, 1]], [0, 100]);

describe('Region', () => {
  it('renders region label', () => {
    const {getByText} = render(
      <svg>
        <Region scaleX={scaleX} region={{name: 'r1', posStart: 1, posEnd: 5, shapeType: 'rect'}} />
      </svg>
    );
    expect(getByText('R1')).toBeInTheDocument();
  });

  it('renders region with wavy shape', () => {
    const {container} = render(
      <svg>
        <Region 
          scaleX={scaleX} 
          region={{
            name: 'r1',
            posStart: 1,
            posEnd: 8,
            shapeType: 'wavy',
            wavyRepeats: 3
          }}
        />
      </svg>
    );
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('renders region with label position "after"', () => {
    const {getByText} = render(
      <svg>
        <Region 
          scaleX={scaleX} 
          region={{
            name: 'r1',
            posStart: 1,
            posEnd: 5,
            shapeType: 'rect',
            labelPosition: 'after'
          }}
        />
      </svg>
    );
    expect(getByText('R1')).toBeInTheDocument();
  });

  it('renders region with label position "below"', () => {
    const {getByText} = render(
      <svg>
        <Region 
          scaleX={scaleX} 
          region={{
            name: 'r1',
            posStart: 1,
            posEnd: 5,
            shapeType: 'rect',
            labelPosition: 'below'
          }}
        />
      </svg>
    );
    expect(getByText('R1')).toBeInTheDocument();
  });

  it('renders region with custom color and offsetY', () => {
    const {getByText} = render(
      <svg>
        <Region 
          scaleX={scaleX} 
          region={{
            name: 'r1',
            posStart: 1,
            posEnd: 5,
            shapeType: 'rect',
            color: '#ff0000',
            offsetY: 20
          }}
        />
      </svg>
    );
    expect(getByText('R1')).toBeInTheDocument();
  });

  it('renders narrow region with wavy shape', () => {
    const {container} = render(
      <svg>
        <Region 
          scaleX={scaleX} 
          region={{
            name: 'r1',
            posStart: 1,
            posEnd: 1.5,
            shapeType: 'wavy',
            wavyRepeats: 2
          }}
        />
      </svg>
    );
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  it('renders region with line shape', () => {
    const {getByText} = render(
      <svg>
        <Region 
          scaleX={scaleX} 
          region={{
            name: 'r1',
            posStart: 1,
            posEnd: 5,
            shapeType: 'line'
          }}
        />
      </svg>
    );
    expect(getByText('R1')).toBeInTheDocument();
  });

  it('renders region with label position "over"', () => {
    const {getByText} = render(
      <svg>
        <Region 
          scaleX={scaleX} 
          region={{
            name: 'r1',
            posStart: 1,
            posEnd: 5,
            shapeType: 'rect',
            labelPosition: 'over'
          }}
        />
      </svg>
    );
    expect(getByText('R1')).toBeInTheDocument();
  });

  it('renders region with label position "above"', () => {
    const {getByText} = render(
      <svg>
        <Region 
          scaleX={scaleX} 
          region={{
            name: 'r1',
            posStart: 1,
            posEnd: 5,
            shapeType: 'rect',
            labelPosition: 'above'
          }}
        />
      </svg>
    );
    expect(getByText('R1')).toBeInTheDocument();
  });

  it('renders very narrow wavy region with width less than 1.5', () => {
    // Create a scale where the region width will be < 1.5 pixels
    const narrowScale = createTestScale([[0, 100, 1]], [0, 10]);
    const {container} = render(
      <svg>
        <Region 
          scaleX={narrowScale} 
          region={{
            name: 'r1',
            posStart: 50,
            posEnd: 50.1, // Very narrow region
            shapeType: 'wavy',
            wavyRepeats: 1
          }}
        />
      </svg>
    );
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  it('returns null for wavy region with NaN position', () => {
    // Create a scale with gaps, then use a position in the gap to produce NaN
    const gappedScale = createTestScale([[0, 10, 1], [20, 30, 1]], [0, 100]);
    const {container} = render(
      <svg>
        <Region 
          scaleX={gappedScale} 
          region={{
            name: 'r1',
            posStart: 15, // In the gap between domains
            posEnd: 16,
            shapeType: 'wavy',
            wavyRepeats: 1
          }}
        />
      </svg>
    );
    // Should not render anything when position is NaN (returns null)
    expect(container.querySelector('path')).not.toBeInTheDocument();
    expect(container.querySelector('text')).not.toBeInTheDocument();
  });
});
