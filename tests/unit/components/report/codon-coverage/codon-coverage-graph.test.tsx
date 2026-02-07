import React from 'react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CodonCoverageGraph from '../../../../../src/components/report/codon-coverage/codon-coverage-graph';

vi.mock('../../../../../src/components/report/codon-coverage/style.module.scss', () => ({ default: { instruction: 'instruction', 'left-axis': 'left-axis', 'main-graph-container': 'main-graph-container', footnote: 'footnote' } }));

describe('CodonCoverageGraph', () => {
  it('renders instruction and footnote', () => {
    const genes = [{ strain: { name: 'strain' }, name: 'G', length: 2 }];
    const coverage = [
      { gene: { name: 'G' }, position: 1, totalReads: 5, isTrimmed: false }
    ];
    render(
      <CodonCoverageGraph
        genes={genes}
        codonReadsCoverage={coverage}
        containerWidth={500}
        minPositionReads={1}
      />
    );
    expect(screen.getByText(/Scroll right for more/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Horizontal dashed line: minimal read depth/i)
    ).toBeInTheDocument();
  });
});
