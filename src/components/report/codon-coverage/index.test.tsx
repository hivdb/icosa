import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('./codon-coverage-graph', () => ({
  default: (props: any) => <div data-testid="graph" data-width={props.containerWidth} />
}));
vi.mock('graphql-tag.macro', () => ({
  default: () => ''
}));

import CodonReadsCoverage from './index';

describe('CodonReadsCoverage', () => {
  it('renders coverage graph for available genes', () => {
    const genes = [{ strain: { name: 'A' }, name: 'G1', length: 10 }];
    const coverage = JSON.stringify([
      { gene: { name: 'G1' }, position: 1, totalReads: 5, isTrimmed: false }
    ]);
    render(
      <CodonReadsCoverage genes={genes} internalJsonCodonReadsCoverage={coverage} />
    );
    expect(screen.getByText('Codon read coverage')).toBeInTheDocument();
    const graph = screen.getByTestId('graph');
    expect(graph.getAttribute('data-width')).toBe('50');
  });
});
