import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../dr-comment-by-types', () => ({__esModule: true, default: () => <div>comments</div>}));
vi.mock('./dr-mutation-by-types', () => ({__esModule: true, default: () => <div>mutations</div>}));

import DRInterpretation from './index';

describe('DRInterpretation', () => {
  const geneDR = {
    algorithm: {family: 'Algo', version: '1', publishDate: '2020'},
    gene: {
      name: 'PR',
      drugClasses: [{name: 'PI', fullName: 'Protease Inhibitor'}]
    },
    levels: [
      {
        drug: {name: 'DRV', fullName: 'Darunavir', displayAbbr: 'DRV'},
        text: 'High',
        drugClass: {name: 'PI'}
      }
    ],
    mutationsByTypes: [
      {mutationType: 'Major', mutations: [{text: 'A23B', isUnsequenced: false}]}
    ],
    commentsByTypes: [
      {
        commentType: 'Major',
        comments: [{name: 'A23B', text: 'Example comment', highlightText: ['A23B']}]
      }
    ]
  };

  it('shows suppression message when suppressDRI is true', () => {
    render(
      <DRInterpretation
        geneDR={geneDR}
        suppressDRI
        suppressLevels={false}
        disabledDrugs={[]}
      />
    );
    expect(
      screen.getByText(
        /Drug resistance interpretation is suppressed due to failed quality assessment/
      )
    ).toBeInTheDocument();
  });

  it('renders levels and comments when not suppressed', async () => {
    render(
      <DRInterpretation
        geneDR={geneDR}
        suppressDRI={false}
        suppressLevels={false}
        disabledDrugs={[]}
      />
    );
    expect(screen.getByText('comments')).toBeInTheDocument();
  });
});
