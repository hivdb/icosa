import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('./mutations-tagsinput', () => ({
  __esModule: true,
  default: ({onChange}: any) => (
    <button data-testid="tagsinput" onClick={() => onChange({mutations: ['C']}, false)} />
  )
}));

vi.mock('./mutation-prefills', () => ({
  __esModule: true,
  default: () => null
}));

vi.mock('./mutation-suggest-options', () => ({
  __esModule: true,
  default: ({onChange}: any) => (
    <button data-testid="suggest" onClick={() => onChange({value: 'mut', label: 'L'})} />
  )
}));

vi.mock('../../utils/mutation', () => ({
  sanitizeMutations: (muts: string[]) => [muts, []]
}));

import MutationsInput from './index';

describe('MutationsInput', () => {
  it('handles suggestion selection', () => {
    const onChange = vi.fn();
    const config = {mutationSuggestions: [{gene: 'g', mutations: [[1, ['A']]]}], geneReferences: {}, geneDisplay: {}};
    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    fireEvent.click(screen.getByTestId('suggest'));
    expect(onChange).toHaveBeenCalledWith({mutations: ['mut']}, false);
  });
});
