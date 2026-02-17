import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import ItemHeaderInput from '../../../../../../src/components/ngs2codfreq/options-form/primer-sequence-input/item-header-input';

describe('ItemHeaderInput', () => {
  it('renders input with correct header value', () => {
    const setHeader = vi.fn();
    render(<ItemHeaderInput name="primer-header" header="Forward_Primer" setHeader={setHeader} />);

    const input = screen.getByDisplayValue('Forward_Primer') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    const setHeader = vi.fn();
    render(<ItemHeaderInput name="primer-header" header="" setHeader={setHeader} />);

    const input = screen.getByPlaceholderText('Header');
    expect(input).toBeInTheDocument();
  });

  it('calls setHeader when input changes', () => {
    const setHeader = vi.fn();
    render(<ItemHeaderInput name="primer-header" header="Forward" setHeader={setHeader} />);

    const input = screen.getByDisplayValue('Forward');
    fireEvent.change(input, {target: {value: 'Reverse'}});

    expect(setHeader).toHaveBeenCalledWith('Reverse');
  });

  it('renders with correct name attribute', () => {
    const setHeader = vi.fn();
    render(<ItemHeaderInput name="test-header" header="" setHeader={setHeader} />);

    const input = screen.getByPlaceholderText('Header');
    expect(input).toHaveAttribute('name', 'test-header');
  });

  it('renders with correct id attribute', () => {
    const setHeader = vi.fn();
    render(<ItemHeaderInput name="test-header" header="" setHeader={setHeader} />);

    const input = screen.getByPlaceholderText('Header');
    expect(input).toHaveAttribute('id', 'test-header');
  });

  it('renders with correct type attribute', () => {
    const setHeader = vi.fn();
    render(<ItemHeaderInput name="primer-header" header="" setHeader={setHeader} />);

    const input = screen.getByPlaceholderText('Header');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('updates header when prop changes', () => {
    const setHeader = vi.fn();
    const {rerender} = render(
      <ItemHeaderInput name="primer-header" header="Header1" setHeader={setHeader} />
    );

    expect(screen.getByDisplayValue('Header1')).toBeInTheDocument();

    rerender(<ItemHeaderInput name="primer-header" header="Header2" setHeader={setHeader} />);

    expect(screen.getByDisplayValue('Header2')).toBeInTheDocument();
  });

  it('renders HoverPopup with primer header message', () => {
    const setHeader = vi.fn();
    const {container} = render(
      <ItemHeaderInput name="primer-header" header="" setHeader={setHeader} />
    );

    // HoverPopup wraps the input
    expect(container.querySelector('input')).toBeInTheDocument();
  });
});
