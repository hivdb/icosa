import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../../../src/components/mutations-input/mutations-tagsinput', () => ({
  __esModule: true,
  default: ({onChange}: any) => (
    <button data-testid="tagsinput" onClick={() => onChange({mutations: ['C']}, false)} />
  )
}));

vi.mock('../../../../src/components/mutations-input/mutation-prefills', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('../../../../src/components/mutations-input/mutation-suggest-options', () => ({
  __esModule: true,
  default: ({onChange}: any) => (
    <button data-testid="suggest" onClick={() => onChange({value: 'mut', label: 'L'})} />
  )
}));

vi.mock('../../../../src/utils/mutation', () => ({
  sanitizeMutations: (muts: string[]) => [muts, []]
}));

import MutationsInput, { MutationsConfig } from '../../../../src/components/mutations-input';

describe('MutationsInput', () => {
  it('handles suggestion selection', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [{
        gene: 'g',
        mutations: [[1, ['A'] as Iterable<string>]]
      }],
      geneReferences: { g: 'A' },
      geneDisplay: { g: 'G' },
      geneSynonyms: {},
      messages: {}
    };
    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('suggest'));
    expect(onChange).toHaveBeenCalledWith({mutations: ['mut']}, false);
  });
});
