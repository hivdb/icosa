import React from 'react';
import {render, screen} from '@testing-library/react';
import {vi} from 'vitest';

// mock found router
vi.mock('found', () => ({
  useRouter: () => ({router: {push: vi.fn(), replace: vi.fn()}, match: {location: {}}})
}));

import SequenceReadsInputForm from '../../../../../src/components/analyze-forms/sequence-reads-input-form';
import ConfigContext from '../../../../../src/utils/config-context';

// Mock seq-summary dependency used deep inside
vi.mock('../../../../../src/components/report/seq-summary', () => ({
  default: () => null,
  MinPositionReads: () => null,
  MaxMixtureRate: () => null,
  MinPrevalence: () => null
}));

it('renders file input for reads', async () => {
  const config = {geneValidatorDefs: [], messages: {'seqreads-analysis-form-placeholder': 'drop'}};
  render(
    <ConfigContext.Provider value={config}>
      <SequenceReadsInputForm to="/reads" outputOptions={{}} />
    </ConfigContext.Provider>
  );
  const label = await screen.findByText('Upload file(s):');
  expect(label).toBeTruthy();
});

