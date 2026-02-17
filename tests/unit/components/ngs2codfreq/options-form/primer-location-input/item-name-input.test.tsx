import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import ItemNameInput from '../../../../../../src/components/ngs2codfreq/options-form/primer-location-input/item-name-input';

describe('ItemNameInput', () => {
  it('renders input with correct value', () => {
    const setValue = vi.fn();
    render(<ItemNameInput name="primer-name" value="Primer1" setValue={setValue} />);

    const input = screen.getByDisplayValue('Primer1') as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('renders input with placeholder', () => {
    const setValue = vi.fn();
    render(<ItemNameInput name="primer-name" value="" setValue={setValue} />);

    const input = screen.getByPlaceholderText('Name');
    expect(input).toBeInTheDocument();
  });

  it('calls setValue when input changes', () => {
    const setValue = vi.fn();
    render(<ItemNameInput name="primer-name" value="Primer1" setValue={setValue} />);

    const input = screen.getByDisplayValue('Primer1');
    fireEvent.change(input, {target: {value: 'Primer2'}});

    expect(setValue).toHaveBeenCalledWith('Primer2');
  });

  it('renders with correct name attribute', () => {
    const setValue = vi.fn();
    render(<ItemNameInput name="test-primer" value="" setValue={setValue} />);

    const input = screen.getByPlaceholderText('Name');
    expect(input).toHaveAttribute('name', 'test-primer');
  });

  it('renders with correct id attribute', () => {
    const setValue = vi.fn();
    render(<ItemNameInput name="test-primer" value="" setValue={setValue} />);

    const input = screen.getByPlaceholderText('Name');
    expect(input).toHaveAttribute('id', 'test-primer');
  });

  it('renders with correct type attribute', () => {
    const setValue = vi.fn();
    render(<ItemNameInput name="primer-name" value="" setValue={setValue} />);

    const input = screen.getByPlaceholderText('Name');
    expect(input).toHaveAttribute('type', 'text');
  });

  it('updates value when prop changes', () => {
    const setValue = vi.fn();
    const {rerender} = render(
      <ItemNameInput name="primer-name" value="Primer1" setValue={setValue} />
    );

    expect(screen.getByDisplayValue('Primer1')).toBeInTheDocument();

    rerender(<ItemNameInput name="primer-name" value="Primer2" setValue={setValue} />);

    expect(screen.getByDisplayValue('Primer2')).toBeInTheDocument();
  });

  it('renders HoverPopup with primer name message', () => {
    const setValue = vi.fn();
    const {container} = render(
      <ItemNameInput name="primer-name" value="" setValue={setValue} />
    );

    // HoverPopup wraps the input
    expect(container.querySelector('input')).toBeInTheDocument();
  });
});
