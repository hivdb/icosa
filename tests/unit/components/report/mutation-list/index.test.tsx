import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import MutationList from '../../../../../src/components/report/mutation-list';
import ConfigContext from '../../../../../src/utils/config-context';
import type {GeneSequence} from '../../../../../src/components/report/mutation-list/types';

vi.mock('../../../../../src/components/report/mutation-list/gene-mutation-list', () => ({
  default: ({gene}: {gene: {name: string}}) => (
    <li data-testid={`gene-${gene.name}`}>{gene.name}</li>
  )
}));

describe('MutationList', () => {
  const mockConfig = {
    geneDisplay: {
      PR: 'Protease',
      RT: 'Reverse Transcriptase',
      IN: 'Integrase'
    },
    messages: {
      'mutation-popup': 'Test message'
    },
    highlightUnusualMutation: true,
    highlightDRM: true,
    highlightApobecMutation: true,
    highlightApobecDRM: true
  };

  const createGeneSequence = (geneName: string): GeneSequence => ({
    gene: {name: geneName},
    mutations: [
      {
        AAs: 'M',
        text: 'M184V',
        reference: 'M',
        position: 184,
        isUnsequenced: false
      }
    ]
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty list when no gene sequences provided', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([mockConfig, false]);
    const {container} = render(<MutationList />);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('renders gene mutation lists from allGeneSequenceReads', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([mockConfig, false]);
    const geneSeqs = [createGeneSequence('PR'), createGeneSequence('RT')];
    render(<MutationList allGeneSequenceReads={geneSeqs} />);
    expect(screen.getByTestId('gene-PR')).toBeInTheDocument();
    expect(screen.getByTestId('gene-RT')).toBeInTheDocument();
  });

  it('renders gene mutation lists from alignedGeneSequences', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([mockConfig, false]);
    const geneSeqs = [createGeneSequence('IN')];
    render(<MutationList alignedGeneSequences={geneSeqs} />);
    expect(screen.getByTestId('gene-IN')).toBeInTheDocument();
  });

  it('renders gene mutation lists from allGeneMutations', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([mockConfig, false]);
    const geneSeqs = [createGeneSequence('PR')];
    render(<MutationList allGeneMutations={geneSeqs} />);
    expect(screen.getByTestId('gene-PR')).toBeInTheDocument();
  });

  it('prioritizes allGeneSequenceReads over other sources', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([mockConfig, false]);
    const seqReads = [createGeneSequence('PR')];
    const aligned = [createGeneSequence('RT')];
    const mutations = [createGeneSequence('IN')];
    
    render(
      <MutationList
        allGeneSequenceReads={seqReads}
        alignedGeneSequences={aligned}
        allGeneMutations={mutations}
      />
    );
    
    expect(screen.getByTestId('gene-PR')).toBeInTheDocument();
    expect(screen.queryByTestId('gene-RT')).not.toBeInTheDocument();
    expect(screen.queryByTestId('gene-IN')).not.toBeInTheDocument();
  });

  it('prioritizes alignedGeneSequences over allGeneMutations', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([mockConfig, false]);
    const aligned = [createGeneSequence('RT')];
    const mutations = [createGeneSequence('IN')];
    
    render(
      <MutationList
        alignedGeneSequences={aligned}
        allGeneMutations={mutations}
      />
    );
    
    expect(screen.getByTestId('gene-RT')).toBeInTheDocument();
    expect(screen.queryByTestId('gene-IN')).not.toBeInTheDocument();
  });

  it('renders empty list when config is null', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([null, false]);
    const geneSeqs = [createGeneSequence('PR')];
    const {container} = render(<MutationList allGeneMutations={geneSeqs} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('renders empty list when config is missing geneDisplay', () => {
    const invalidConfig = {messages: {'mutation-popup': 'Test'}};
    vi.spyOn(ConfigContext, 'use').mockReturnValue([invalidConfig, false]);
    const geneSeqs = [createGeneSequence('PR')];
    const {container} = render(<MutationList allGeneMutations={geneSeqs} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('renders empty list when config is missing messages', () => {
    const invalidConfig = {geneDisplay: {PR: 'Protease'}};
    vi.spyOn(ConfigContext, 'use').mockReturnValue([invalidConfig, false]);
    const geneSeqs = [createGeneSequence('PR')];
    const {container} = render(<MutationList allGeneMutations={geneSeqs} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('renders multiple gene sequences', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([mockConfig, false]);
    const geneSeqs = [
      createGeneSequence('PR'),
      createGeneSequence('RT'),
      createGeneSequence('IN')
    ];
    render(<MutationList allGeneMutations={geneSeqs} />);
    expect(screen.getByTestId('gene-PR')).toBeInTheDocument();
    expect(screen.getByTestId('gene-RT')).toBeInTheDocument();
    expect(screen.getByTestId('gene-IN')).toBeInTheDocument();
  });

  it('handles empty arrays for all props', () => {
    vi.spyOn(ConfigContext, 'use').mockReturnValue([mockConfig, false]);
    const {container} = render(
      <MutationList
        allGeneSequenceReads={[]}
        alignedGeneSequences={[]}
        allGeneMutations={[]}
      />
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });
});
