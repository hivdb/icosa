import React from 'react';
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import CodfishGraph, { CodfishRecord } from '../../../../../src/components/report/seqreads-qa/codfish-graph';

vi.mock('../../../../../src/components/report/seqreads-qa/style.module.scss', () => ({ default: { 'codfish-graph': 'codfish-graph' } }));

describe('CodfishGraph', () => {
  it('renders bars for records', () => {
    const extCodfish: CodfishRecord[] = [
      {
        gene: 'G',
        ref: 'A',
        pos: 1,
        aa: 'B',
        cd: 'AAA',
        pcnt: 0.1,
        isUnusual: false,
        accumScore: 1
      }
    ];
    const { container } = render(<CodfishGraph extCodfish={extCodfish} />);
    expect(container.querySelectorAll('rect').length).toBeGreaterThan(0);
  });
});
