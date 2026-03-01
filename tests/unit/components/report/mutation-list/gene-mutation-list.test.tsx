import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import GeneMutationList from '../../../../../src/components/report/mutation-list/gene-mutation-list';
import type {Mutation} from '../../../../../src/components/report/mutation-list/types';

vi.mock('../../../../../src/components/mutation', () => ({
  default: ({text, gene}: {text: string; gene: string}) => (
    <li data-testid={`mutation-${gene}-${text}`}>{text}</li>
  )
}));

vi.mock('../../../../../src/utils/shorten-mutation-list', () => ({
  default: (mutations: Mutation[]) => mutations
}));

describe('GeneMutationList', () => {
  const mockConfig = {
    geneDisplay: {
      PR: 'Protease',
      RT: 'Reverse Transcriptase'
    },
    messages: {
      'mutation-popup': 'Test message'
    },
    highlightUnusualMutation: true,
    highlightDRM: true,
    highlightApobecMutation: true,
    highlightApobecDRM: true
  };

  const mockGeneDisplay = {
    PR: 'Protease',
    RT: 'Reverse Transcriptase',
    IN: 'Integrase'
  };

  const createMutation = (text: string, position: number, isUnsequenced = false): Mutation => ({
    AAs: text.slice(-1),
    text,
    reference: text[0],
    position,
    isUnsequenced
  });

  it('renders gene name with display name from geneDisplay', () => {
    const mutations = [createMutation('M184V', 184)];
    render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'PR'}}
        mutations={mutations}
      />
    );
    expect(screen.getByText('Protease')).toBeInTheDocument();
  });

  it('renders gene name as-is when not in geneDisplay', () => {
    const mutations = [createMutation('M184V', 184)];
    render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'UNKNOWN'}}
        mutations={mutations}
      />
    );
    expect(screen.getByText('UNKNOWN')).toBeInTheDocument();
  });

  it('renders mutation list for gene', () => {
    const mutations = [
      createMutation('M184V', 184),
      createMutation('K103N', 103)
    ];
    render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
        mutations={mutations}
      />
    );
    expect(screen.getByTestId('mutation-RT-M184V')).toBeInTheDocument();
    expect(screen.getByTestId('mutation-RT-K103N')).toBeInTheDocument();
  });

  it('filters out unsequenced mutations', () => {
    const mutations = [
      createMutation('M184V', 184, false),
      createMutation('K103N', 103, true),
      createMutation('Y181C', 181, false)
    ];
    render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
        mutations={mutations}
      />
    );
    expect(screen.getByTestId('mutation-RT-M184V')).toBeInTheDocument();
    expect(screen.queryByTestId('mutation-RT-K103N')).not.toBeInTheDocument();
    expect(screen.getByTestId('mutation-RT-Y181C')).toBeInTheDocument();
  });

  it('renders nothing when all mutations are unsequenced', () => {
    const mutations = [
      createMutation('M184V', 184, true),
      createMutation('K103N', 103, true)
    ];
    const {container} = render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
        mutations={mutations}
      />
    );
    expect(container.querySelector('li')).not.toBeInTheDocument();
  });

  it('renders nothing when mutations array is empty', () => {
    const {container} = render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
        mutations={[]}
      />
    );
    expect(container.querySelector('li')).not.toBeInTheDocument();
  });

  it('renders nothing when mutations is undefined', () => {
    const {container} = render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
      />
    );
    expect(container.querySelector('li')).not.toBeInTheDocument();
  });

  it('renders single mutation', () => {
    const mutations = [createMutation('M184V', 184)];
    render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
        mutations={mutations}
      />
    );
    expect(screen.getByTestId('mutation-RT-M184V')).toBeInTheDocument();
  });

  it('memoizes shortened mutation list', () => {
    const mutations = [createMutation('M184V', 184)];
    const {rerender} = render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
        mutations={mutations}
      />
    );
    
    // Rerender with same mutations - should use memoized value
    rerender(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
        mutations={mutations}
      />
    );
    
    expect(screen.getByTestId('mutation-RT-M184V')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const mutations = [createMutation('M184V', 184)];
    const {container} = render(
      <GeneMutationList
        config={mockConfig}
        geneDisplay={mockGeneDisplay}
        gene={{name: 'RT'}}
        mutations={mutations}
      />
    );
    
    const geneItem = container.querySelector('li');
    expect(geneItem?.className).toContain('gene-item');
    
    const geneName = container.querySelector('strong');
    expect(geneName?.className).toContain('gene-name');
    
    const mutationList = container.querySelector('ul');
    expect(mutationList?.className).toContain('gene-mutation-list');
  });
});
