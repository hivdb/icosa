 import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import BarStack from '../../../../../src/components/report/codon-coverage/BarStack';

vi.mock('@vx/group', () => ({ Group: (props: any) => <g {...props} /> }));
vi.mock('@vx/shape', () => ({ Bar: (props: any) => <rect data-testid="bar" {...props} /> }));

// xScale and yScale mocks with minimal APIs
const xScale: any = (x: string) => (x === 'a' ? 0 : 10);
xScale.bandwidth = () => 10;
const yScale: any = (y: number) => 100 - y;

it('renders stacked bars', () => {
  const data = [
    { x: 'a', A: 10, B: 20 },
    { x: 'b', A: 5, B: 15 }
  ];
  render(
    <svg>
      <BarStack
        data={data}
        x={(d: any) => d.x}
        xScale={xScale}
        yScale={yScale}
        color={() => 'red'}
        keys={['A', 'B']}
      />
    </svg>
  );
  expect(document.querySelectorAll('[data-testid="bar"]').length).toBe(4);
});
