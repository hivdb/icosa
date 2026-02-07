import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../../../../src/components/mutation', () => ({default: ({text}: any) => <span>{text}</span>}));

vi.mock('../../../../../src/utils/config-context', () => ({default: {use: () => [{geneDisplay: {}, messages: {}}]}}));

import DRMutationByTypes from '../../../../../src/components/report/dr-interpretation/dr-mutation-by-types';

describe('DRMutationByTypes', () => {
  const gene = {name: 'PR'};
  const mutationsByTypes = [
    {mutationType: 'Major', mutations: [{text: 'A23B', isUnsequenced: false, AAs: 'A23B', reference: '', position: 23}]},
    {mutationType: 'Dosage', mutations: [{text: 'X', isUnsequenced: false, AAs: 'X', reference: '', position: 1}]}
  ];

  it('renders mutation list and skips dosage type', async () => {
    render(
      <DRMutationByTypes gene={gene} mutationsByTypes={mutationsByTypes} />
    );
    expect(await screen.findByText('A23B')).toBeInTheDocument();
    expect(screen.queryByText(/Dosage/)).not.toBeInTheDocument();
  });
});
