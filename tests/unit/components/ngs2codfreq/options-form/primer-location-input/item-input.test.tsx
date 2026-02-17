import React from 'react';
import {render, screen, fireEvent, within} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import PrimerBedItemInput from '../../../../../../src/components/ngs2codfreq/options-form/primer-location-input/item-input';
import type {PrimerBed} from '../../../../../../src/components/ngs2codfreq/options-form/types';

describe('PrimerBedItemInput', () => {
  const defaultValue: PrimerBed = {
    idx: 0,
    region: 'NC_045512',
    start: 10,
    end: 30,
    name: 'primer1',
    score: 60,
    strand: '+'
  };

  const refSequence = 'ACGTACGTACGTACGTACGTACGTACGTACGTACGTACGT';

  it('renders with initial values', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    expect(screen.getByDisplayValue('primer1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });

  it('shows Remove button when not dirty and not new', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Remove')).toBeInTheDocument();
    expect(screen.queryByText('Update')).not.toBeInTheDocument();
    expect(screen.queryByText('Reset')).not.toBeInTheDocument();
  });

  it('shows Add button when isNew is true', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        isNew={true}
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Add')).toBeInTheDocument();
    // Note: Remove button may still be rendered but not visible based on component logic
  });

  it('shows Update and Reset buttons when dirty', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const nameInput = screen.getByDisplayValue('primer1');
    fireEvent.change(nameInput, {target: {value: 'primer2'}});

    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('calls onChange with updated values when Add is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        isNew={true}
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        idx: 0,
        region: 'NC_045512',
        start: 10,
        end: 30,
        name: 'primer1',
        score: 60,
        strand: '+'
      }),
      true
    );
  });

  it('calls onChange with updated values when Update is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const nameInput = screen.getByDisplayValue('primer1');
    fireEvent.change(nameInput, {target: {value: 'primer2'}});

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'primer2'
      }),
      false
    );
  });

  it('calls onChange with idx when Remove is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith({idx: 0}, false, true);
  });

  it('resets values when Reset is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const nameInput = screen.getByDisplayValue('primer1');
    fireEvent.change(nameInput, {target: {value: 'changed'}});
    expect(screen.getByDisplayValue('changed')).toBeInTheDocument();

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(screen.getByDisplayValue('primer1')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('changed')).not.toBeInTheDocument();
  });

  it('updates start position when input changes', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const startInput = screen.getByDisplayValue('10');
    fireEvent.change(startInput, {target: {value: '15'}});

    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
  });

  it('updates end position when input changes', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const endInput = screen.getByDisplayValue('30');
    fireEvent.change(endInput, {target: {value: '35'}});

    expect(screen.getByDisplayValue('35')).toBeInTheDocument();
  });

  it('updates name when input changes', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const nameInput = screen.getByDisplayValue('primer1');
    fireEvent.change(nameInput, {target: {value: 'newname'}});

    expect(screen.getByDisplayValue('newname')).toBeInTheDocument();
  });

  it('updates strand when radio button changes', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const reverseRadio = screen.getByLabelText('reverse (-)');
    fireEvent.click(reverseRadio);

    expect(reverseRadio).toBeChecked();
  });

  it('disables Add/Update button when name is empty', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        isNew={true}
        name="primer"
        value={{...defaultValue, name: ''}}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const addButton = screen.getByRole('button', {name: 'Add'});
    expect(addButton).toBeDisabled();
  });

  it('disables Add/Update button when start is negative', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        isNew={true}
        name="primer"
        value={{...defaultValue, start: -1}}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const addButton = screen.getByRole('button', {name: 'Add'});
    expect(addButton).toBeDisabled();
  });

  it('disables Add/Update button when end <= start', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        isNew={true}
        name="primer"
        value={{...defaultValue, start: 30, end: 30}}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const addButton = screen.getByRole('button', {name: 'Add'});
    expect(addButton).toBeDisabled();
  });

  it('selects all text when number input is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const startInput = screen.getByDisplayValue('10') as HTMLInputElement;
    const selectSpy = vi.spyOn(startInput, 'select');

    fireEvent.click(startInput);

    expect(selectSpy).toHaveBeenCalled();
  });

  it('renders sequence preview for valid positions', () => {
    const onChange = vi.fn();
    const {container} = render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const preview = container.querySelector('pre');
    expect(preview).toBeInTheDocument();
  });

  it('does not render sequence preview for invalid positions (start < 0)', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const startInput = screen.getByDisplayValue('10');
    fireEvent.change(startInput, {target: {value: '-1'}});

    const {container} = render(
      <PrimerBedItemInput
        name="primer"
        value={{...defaultValue, start: -1}}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const preview = container.querySelector('pre');
    expect(preview).not.toBeInTheDocument();
  });

  it('does not render sequence preview when end <= start', () => {
    const onChange = vi.fn();
    const {container} = render(
      <PrimerBedItemInput
        name="primer"
        value={{...defaultValue, start: 30, end: 20}}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const preview = container.querySelector('pre');
    expect(preview).not.toBeInTheDocument();
  });

  it('renders forward strand indicator in preview', () => {
    const onChange = vi.fn();
    const {container} = render(
      <PrimerBedItemInput
        name="primer"
        value={{...defaultValue, strand: '+'}}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const preview = container.querySelector('pre');
    expect(preview?.textContent).toContain('>');
  });

  it('renders reverse strand indicator in preview', () => {
    const onChange = vi.fn();
    const {container} = render(
      <PrimerBedItemInput
        name="primer"
        value={{...defaultValue, strand: '-'}}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const preview = container.querySelector('pre');
    expect(preview?.textContent).toContain('<');
  });

  it('renders both forward and reverse strand radio options', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('forward (+)')).toBeInTheDocument();
    expect(screen.getByLabelText('reverse (-)')).toBeInTheDocument();
  });

  it('checks the correct strand radio button', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={{...defaultValue, strand: '+'}}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const forwardRadio = screen.getByLabelText('forward (+)') as HTMLInputElement;
    const reverseRadio = screen.getByLabelText('reverse (-)') as HTMLInputElement;

    expect(forwardRadio.checked).toBe(true);
    expect(reverseRadio.checked).toBe(false);
  });

  it('generates correct input IDs', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="test-primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    expect(screen.getByDisplayValue('10')).toHaveAttribute('id', 'test-primer-0-start');
    expect(screen.getByDisplayValue('30')).toHaveAttribute('id', 'test-primer-0-end');
  });

  it('sets data-dirty attribute when dirty', () => {
    const onChange = vi.fn();
    const {container} = render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const nameInput = screen.getByDisplayValue('primer1');
    fireEvent.change(nameInput, {target: {value: 'changed'}});

    const row = container.querySelector('[data-dirty]');
    expect(row).toHaveAttribute('data-dirty', 'true');
  });

  it('handles NaN start value by showing empty input', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const startInput = screen.getByDisplayValue('10');
    fireEvent.change(startInput, {target: {value: ''}});

    expect(startInput).toHaveValue(null);
  });

  it('handles NaN end value by showing empty input', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const endInput = screen.getByDisplayValue('30');
    fireEvent.change(endInput, {target: {value: ''}});

    expect(endInput).toHaveValue(null);
  });

  it('updates all fields and saves correctly', () => {
    const onChange = vi.fn();
    render(
      <PrimerBedItemInput
        isNew={true}
        name="primer"
        value={defaultValue}
        refSequence={refSequence}
        onChange={onChange}
      />
    );

    const nameInput = screen.getByDisplayValue('primer1');
    const startInput = screen.getByDisplayValue('10');
    const endInput = screen.getByDisplayValue('30');
    const reverseRadio = screen.getByLabelText('reverse (-)');

    fireEvent.change(nameInput, {target: {value: 'updated'}});
    fireEvent.change(startInput, {target: {value: '5'}});
    fireEvent.change(endInput, {target: {value: '25'}});
    fireEvent.click(reverseRadio);

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'updated',
        start: 5,
        end: 25,
        strand: '-'
      }),
      true
    );
  });
});
