import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import DRMutationScores from '../../../../../src/components/report/dr-mutation-scores';

describe('DRMutationScores', () => {
  const baseGeneDR = {
    algorithm: {family: 'Algo', version: '1.0', publishDate: '2020'},
    gene: {
      name: 'PR',
      drugClasses: [{name: 'PI', fullName: 'Protease Inhibitors'}]
    },
    drugScores: [
      {
        drugClass: {name: 'PI'},
        drug: {name: 'DRV', displayAbbr: 'DRV'},
        score: 1,
        partialScores: [
          {mutations: [{text: 'A23B'}], score: 1},
          {mutations: [{text: 'B24C'}], score: 0}
        ]
      },
      {
        drugClass: {name: 'PI'},
        drug: {name: 'ATV', displayAbbr: 'ATV'},
        score: 2,
        partialScores: [{mutations: [{text: 'A23B'}], score: 2}]
      }
    ]
  };

  it('renders mutation scores table', () => {
    render(<DRMutationScores geneDR={baseGeneDR} disabledDrugs={[]} />);
    expect(
      screen.getByText(/Drug resistance mutation scores of PI:/)
    ).toBeInTheDocument();
    expect(screen.getByText('A23B')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows message when no mutation scores are present', () => {
    const geneDREmpty = {...baseGeneDR, drugScores: []};
    render(<DRMutationScores geneDR={geneDREmpty} disabledDrugs={[]} />);
    expect(
      screen.getByText('No drug resistance mutations were found for PI.')
    ).toBeInTheDocument();
  });
});
