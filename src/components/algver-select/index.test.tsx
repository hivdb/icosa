import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import AlgVerSelect, {getLatestVersion} from './index';

describe('AlgVerSelect', () => {
  it('renders placeholder', () => {
    const config = {algorithmVersions: {A: [['1','2020-01-01','HIV']]}, excludeAlgorithmVersions: []};
    render(<AlgVerSelect config={config} onChange={() => {}} />);
    expect(screen.getByText('Select an algorithm...')).toBeInTheDocument();
  });

  it('getLatestVersion returns expected value', () => {
    const result = getLatestVersion('A', {algorithmVersions: {A: [['1','2020-01-01','HIV']]} });
    expect(result.value).toBe('A_1');
  });
});
