import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('react-tagsinput', () => ({
  __esModule: true,
  default: ({value, onChange, inputProps}: any) => (
    <input data-testid="tagsinput" value={value.join(',')} onChange={e => onChange(e.target.value.split(','))} {...inputProps} />
  )
}));

vi.mock('../../../../src/utils/mutation', () => ({
  parseMutation: (m: string) => ['', '', '', m.split(':')[0] || ''],
  sanitizeMutations: (muts: string[]) => [muts, []],
  parseAndValidateMutation: (tag: string) => ({text: tag, errors: []})
}));

vi.mock('../../../../src/components/mutations-input/mutations-errors', () => ({
  __esModule: true,
  default: () => <div data-testid="errors" />
}));

import MutationsTagsInput from '../../../../src/components/mutations-input/mutations-tagsinput';

describe('MutationsTagsInput', () => {
  it('calls onChange with sanitized mutations', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {}, messages: {}};
    render(<MutationsTagsInput config={config} mutations={['A']} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('tagsinput'), {target: {value: 'B'}});
    expect(onChange).toHaveBeenCalledWith({mutations: ['B']}, false);
  });
});
