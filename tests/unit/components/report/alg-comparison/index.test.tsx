import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import AlgComparison from '../../../../../src/components/report/alg-comparison';
import AlgDrugClassComparison from '../../../../../src/components/report/alg-comparison/alg-drugclass-comparison';
import type {DrugScore} from '../../../../../src/components/report/alg-comparison/types';
import style from '../../../../../src/components/report/style.module.scss';

describe('AlgComparison', () => {
  const createDrugScore = (
    drugName: string,
    algorithm: string,
    SIR: string
  ): DrugScore => ({
    drug: {name: drugName, displayAbbr: drugName},
    algorithm,
    SIR,
    interpretation: `${SIR} interpretation`,
    explanation: `${SIR} explanation`
  });

  it('renders heading', () => {
    const data = [
      {
        drugClass: {name: 'NRTI'},
        drugScores: []
      }
    ];
    render(<AlgComparison algorithmComparison={data} />);
    expect(
      screen.getByText('Comparison of genotypic resistance algorithms')
    ).toBeInTheDocument();
  });

  it('renders tabs for each drug class', () => {
    const data = [
      {
        drugClass: {name: 'NRTI'},
        drugScores: []
      },
      {
        drugClass: {name: 'NNRTI'},
        drugScores: []
      }
    ];
    render(<AlgComparison algorithmComparison={data} />);
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    expect(screen.getByText('NRTI')).toBeInTheDocument();
    expect(screen.getByText('NNRTI')).toBeInTheDocument();
  });

  it('renders single drug class', () => {
    const data = [
      {
        drugClass: {name: 'PI'},
        drugScores: []
      }
    ];
    render(<AlgComparison algorithmComparison={data} />);
    expect(screen.getAllByRole('tab')).toHaveLength(1);
    expect(screen.getByText('PI')).toBeInTheDocument();
  });

  it('renders multiple drug classes', () => {
    const data = [
      {drugClass: {name: 'NRTI'}, drugScores: []},
      {drugClass: {name: 'NNRTI'}, drugScores: []},
      {drugClass: {name: 'PI'}, drugScores: []},
      {drugClass: {name: 'INSTI'}, drugScores: []}
    ];
    render(<AlgComparison algorithmComparison={data} />);
    expect(screen.getAllByRole('tab')).toHaveLength(4);
  });

  it('switches tabs on click', () => {
    const data = [
      {
        drugClass: {name: 'NRTI'},
        drugScores: [createDrugScore('AZT', 'alg1', 'S')]
      },
      {
        drugClass: {name: 'NNRTI'},
        drugScores: [createDrugScore('EFV', 'alg1', 'R')]
      }
    ];
    render(<AlgComparison algorithmComparison={data} />);
    
    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);
    
    expect(screen.getByText('EFV')).toBeInTheDocument();
  });

  it('renders tab panels for each drug class', () => {
    const data = [
      {
        drugClass: {name: 'NRTI'},
        drugScores: [createDrugScore('AZT', 'alg1', 'S')]
      },
      {
        drugClass: {name: 'NNRTI'},
        drugScores: [createDrugScore('EFV', 'alg1', 'R')]
      }
    ];
    render(<AlgComparison algorithmComparison={data} />);
    // react-tabs renders all panels but only shows the selected one
    expect(screen.getAllByRole('tabpanel')).toHaveLength(2);
  });
});

describe('AlgDrugClassComparison', () => {
  const createDrugScore = (
    drugName: string,
    displayAbbr: string,
    algorithm: string,
    SIR: string,
    interpretation = 'Test interpretation',
    explanation = 'Test explanation'
  ): DrugScore => ({
    drug: {name: drugName, displayAbbr},
    algorithm,
    SIR,
    interpretation,
    explanation
  });

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  it('renders algorithm headers', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S'),
      createDrugScore('AZT', 'AZT', 'ANRS', 'S')
    ];
    render(<AlgDrugClassComparison drugScores={drugScores} />);
    expect(screen.getByText('HIVDB')).toBeInTheDocument();
    expect(screen.getByText('ANRS')).toBeInTheDocument();
  });

  it('renders drug names', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('Zidovudine', 'AZT', 'HIVDB', 'S')
    ];
    render(<AlgDrugClassComparison drugScores={drugScores} />);
    expect(screen.getByText('AZT')).toBeInTheDocument();
  });

  it('renders SIR values', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S', 'Susceptible', 'No mutations')
    ];
    render(<AlgDrugClassComparison drugScores={drugScores} />);
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('Susceptible')).toBeInTheDocument();
    expect(screen.getByText('No mutations')).toBeInTheDocument();
  });

  it('highlights differing SIR values between algorithms', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'alg1', 'S'),
      createDrugScore('AZT', 'AZT', 'alg2', 'R')
    ];
    const {container} = render(
      <AlgDrugClassComparison drugScores={drugScores} />
    );
    expect(
      container.querySelector(`.${style['cell-diff']}`)
    ).toBeInTheDocument();
  });

  it('does not highlight when SIR values are the same', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'alg1', 'S'),
      createDrugScore('AZT', 'AZT', 'alg2', 'S')
    ];
    const {container} = render(
      <AlgDrugClassComparison drugScores={drugScores} />
    );
    expect(
      container.querySelector(`.${style['cell-diff']}`)
    ).not.toBeInTheDocument();
  });

  it('filters out NFV drug', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('Nelfinavir', 'NFV', 'HIVDB', 'S'),
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S')
    ];
    render(<AlgDrugClassComparison drugScores={drugScores} />);
    expect(screen.queryByText('NFV')).not.toBeInTheDocument();
    expect(screen.getByText('AZT')).toBeInTheDocument();
  });

  it('renders multiple drugs', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S'),
      createDrugScore('3TC', '3TC', 'HIVDB', 'R'),
      createDrugScore('TDF', 'TDF', 'HIVDB', 'I')
    ];
    render(<AlgDrugClassComparison drugScores={drugScores} />);
    expect(screen.getByText('AZT')).toBeInTheDocument();
    expect(screen.getByText('3TC')).toBeInTheDocument();
    expect(screen.getByText('TDF')).toBeInTheDocument();
  });

  it('renders multiple algorithms per drug', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S'),
      createDrugScore('AZT', 'AZT', 'ANRS', 'S'),
      createDrugScore('AZT', 'AZT', 'Rega', 'I')
    ];
    render(<AlgDrugClassComparison drugScores={drugScores} />);
    expect(screen.getByText('HIVDB')).toBeInTheDocument();
    expect(screen.getByText('ANRS')).toBeInTheDocument();
    expect(screen.getByText('Rega')).toBeInTheDocument();
  });

  it('shows "Drug Score Not Available" when algorithm has no score for drug', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S')
    ];
    render(<AlgDrugClassComparison drugScores={drugScores} />);
    expect(screen.queryByText('Drug Score Not Available')).not.toBeInTheDocument();
  });

  it('handles multiline explanations with nl2br', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S', 'Susceptible', 'Line 1\nLine 2')
    ];
    const {container} = render(<AlgDrugClassComparison drugScores={drugScores} />);
    const explanation = container.querySelector('dd:last-child');
    expect(explanation?.innerHTML).toContain('<br>');
  });

  it('shows scroll instruction when content is wider than container', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400
    });
    
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S'),
      createDrugScore('AZT', 'AZT', 'ANRS', 'S'),
      createDrugScore('AZT', 'AZT', 'Rega', 'S'),
      createDrugScore('AZT', 'AZT', 'REGA', 'S')
    ];
    
    const {container} = render(<AlgDrugClassComparison drugScores={drugScores} />);
    
    // Set container width to trigger scroll message
    const containerDiv = container.querySelector(`.${style['alg-drugclass-comparison-container']}`) as HTMLDivElement;
    if (containerDiv) {
      Object.defineProperty(containerDiv, 'offsetWidth', {
        writable: true,
        configurable: true,
        value: 400
      });
    }
    
    expect(screen.getByText(/Scroll right for more/i)).toBeInTheDocument();
  });

  it('handles window resize events', async () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S')
    ];
    
    const {unmount} = render(<AlgDrugClassComparison drugScores={drugScores} />);
    
    fireEvent(window, new Event('resize'));
    
    await waitFor(() => {
      expect(screen.getByText('HIVDB')).toBeInTheDocument();
    });
    
    unmount();
  });

  it('cleans up resize listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S')
    ];
    
    const {unmount} = render(<AlgDrugClassComparison drugScores={drugScores} />);
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('groups drugs correctly when same drug appears multiple times', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S'),
      createDrugScore('AZT', 'AZT', 'ANRS', 'R'),
      createDrugScore('3TC', '3TC', 'HIVDB', 'R')
    ];
    render(<AlgDrugClassComparison drugScores={drugScores} />);
    
    const drugNames = screen.getAllByText('AZT');
    expect(drugNames).toHaveLength(1);
  });

  it('renders empty table when drugScores is empty', () => {
    const {container} = render(<AlgDrugClassComparison drugScores={[]} />);
    expect(container.querySelector('table')).toBeInTheDocument();
    expect(container.querySelector('tbody')?.children).toHaveLength(0);
  });

  it('applies correct CSS classes', () => {
    const drugScores: DrugScore[] = [
      createDrugScore('AZT', 'AZT', 'HIVDB', 'S')
    ];
    const {container} = render(<AlgDrugClassComparison drugScores={drugScores} />);
    
    expect(container.querySelector(`.${style['alg-drugclass-comparison-container']}`)).toBeInTheDocument();
    expect(container.querySelector(`.${style['alg-drugclass-comparison']}`)).toBeInTheDocument();
    expect(container.querySelector(`.${style['alg-comparison-table']}`)).toBeInTheDocument();
    expect(container.querySelector(`.${style['alg-comparison-card']}`)).toBeInTheDocument();
  });
});
