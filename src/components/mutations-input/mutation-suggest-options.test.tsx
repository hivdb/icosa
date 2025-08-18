import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('react-dropdown', () => ({
  __esModule: true,
  default: ({options, onChange}: any) => (
    <select data-testid="dropdown" onChange={e => onChange({value: e.target.value})}>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}));

vi.mock('../../utils/mutation', () => ({
  expandIndel: (aa: string) => aa
}));

import MutationSuggestOptions from './mutation-suggest-options';

describe('MutationSuggestOptions', () => {
  it('invokes onChange when an option selected', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {gene: 'A'}, geneDisplay: {gene: 'Gene'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[[1, ['T']]]}
        config={config}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByTestId('dropdown'), {target: {value: 'gene:A1T'}});
    expect(onChange).toHaveBeenCalledWith({value: 'gene:A1T'});
  });
});
