import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../utils/mutation', () => ({
  sanitizeMutations: vi.fn(() => [[], [{text: 'mut1', errors: ['err']}]] )
}));

import useMutationErrors, {MutationsErrors} from './mutations-errors';

describe('MutationsErrors component', () => {
  it('renders provided errors and handles cleanup', () => {
    const onAutoClean = vi.fn();
    render(
      <MutationsErrors
        allErrors={[{text: 'mut1', errors: ['err1']}]}
        onAutoClean={onAutoClean}
      />
    );
    fireEvent.click(screen.getByText('remove all problematic mutations'));
    expect(onAutoClean).toHaveBeenCalled();
  });
});

describe('useMutationErrors hook', () => {
  it('invokes onPreventSubmit when errors exist', () => {
    const onPreventSubmit = vi.fn();
    const Wrapper = () =>
      useMutationErrors({
        mutations: ['mut1'],
        onChange: vi.fn(),
        onPreventSubmit,
        messages: {},
        geneReferences: {},
        geneSynonyms: {}
      });
    render(<Wrapper />);
    expect(onPreventSubmit).toHaveBeenCalled();
  });
});
