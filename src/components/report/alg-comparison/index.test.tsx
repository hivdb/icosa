import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import AlgComparison, {DrugScore} from './index';
import AlgDrugClassComparison from './alg-drugclass-comparison';
import style from '../style.module.scss';

describe('AlgComparison', () => {
  it('renders tabs for each drug class', () => {
    const data = [
      {
        drugClass: {name: 'NRTI'},
        drugScores: [] as DrugScore[]
      },
      {
        drugClass: {name: 'NNRTI'},
        drugScores: [] as DrugScore[]
      }
    ];
    render(<AlgComparison algorithmComparison={data} />);
    expect(
      screen.getByText('Comparison of genotypic resistance algorithms')
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByText('NRTI')).toBeInTheDocument();
  });
});

describe('AlgDrugClassComparison', () => {
  it('highlights differing SIR values between algorithms', () => {
    const drugScores: DrugScore[] = [
      {
        drug: {name: 'AZT', displayAbbr: 'AZT'},
        algorithm: 'alg1',
        SIR: 'S',
        interpretation: 'Susceptible',
        explanation: '---'
      },
      {
        drug: {name: 'AZT', displayAbbr: 'AZT'},
        algorithm: 'alg2',
        SIR: 'R',
        interpretation: 'Resistant',
        explanation: '---'
      }
    ];
    const {container, unmount} = render(
      <AlgDrugClassComparison drugScores={drugScores} />
    );
    expect(screen.getByText('alg1')).toBeInTheDocument();
    expect(screen.getByText('alg2')).toBeInTheDocument();
    expect(
      container.querySelector(`.${style['cell-diff']}`)
    ).toBeInTheDocument();
    unmount();
  });
});
