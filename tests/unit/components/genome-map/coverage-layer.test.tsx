import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import CoverageLayer from '../../../../src/components/genome-map/coverage-layer';
import {scaleMultipleLinears} from '../../../../src/components/genome-map/helpers';

const scaleX = scaleMultipleLinears([[0, 10, 1]], [0, 100]);

describe('CoverageLayer', () => {
  it('renders coverage paths', () => {
    const {container} = render(
      <CoverageLayer
       offsetY={0}
       height={20}
       scaleX={scaleX}
       posStart={0}
       posEnd={10}
       coverageUpperLimit={10}
       coverages={[{position: 0, coverage: 5}, {position: 5, coverage: 3}]}
      />
    );
    expect(container.querySelectorAll('path').length).toBeGreaterThan(0);
  });
});
