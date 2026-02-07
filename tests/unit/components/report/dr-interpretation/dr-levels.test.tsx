import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import DRLevels from '../../../../../src/components/report/dr-interpretation/dr-levels';

describe('DRLevels', () => {
  const drugClass = {name: 'PI', fullName: 'Protease Inhibitor'};
  const levels = [
    {drug: {name: 'DRV', fullName: 'Darunavir', displayAbbr: 'DRV'}, text: 'High'}
  ];

  it('renders levels for enabled drugs', () => {
    render(
      <DRLevels drugClass={drugClass} levels={levels} disabledDrugs={[]} />
    );
    expect(screen.getByText(/Darunavir/)).toBeInTheDocument();
  });

  it('omits disabled drugs', () => {
    render(
      <DRLevels drugClass={drugClass} levels={levels} disabledDrugs={['DRV']} />
    );
    expect(screen.queryByText(/Darunavir/)).not.toBeInTheDocument();
  });
});
