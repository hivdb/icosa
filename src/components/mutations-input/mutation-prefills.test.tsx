import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import {MutationPrefills, PrefillOption} from './mutation-prefills';
import useMutationPrefills from './mutation-prefills';

describe('MutationPrefills component', () => {
  it('calls onSelect with selected option', () => {
    const opts: PrefillOption[] = [
      {name: 'opt1', mutations: ['A']},
      {name: 'opt2', mutations: ['B']}
    ];
    const onSelect = vi.fn();
    render(
      <MutationPrefills labelMessage="Label" options={opts} onSelect={onSelect} />
    );
    fireEvent.change(screen.getByRole('listbox'), {
      target: {value: 'opt2'}
    });
    expect(onSelect).toHaveBeenCalledWith(opts[1]);
  });
});

describe('useMutationPrefills hook', () => {
  it('renders null when no prefills configured', () => {
    const Stub = () => useMutationPrefills({onChange: vi.fn(), config: {messages: {}}});
    const {container} = render(<Stub />);
    expect(container.firstChild).toBeNull();
  });
});
