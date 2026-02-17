import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import PrimerSeqItemInput from '../../../../../../src/components/ngs2codfreq/options-form/primer-sequence-input/item-input';
import type {PrimerSeq} from '../../../../../../src/components/ngs2codfreq/options-form/types';

describe('PrimerSeqItemInput', () => {
  const defaultValue: PrimerSeq = {
    idx: 0,
    header: 'Forward_Primer',
    sequence: 'ACGTACGT',
    type: 'five-end'
  };

  it('renders with initial values', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    expect(screen.getByDisplayValue('Forward_Primer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ACGTACGT')).toBeInTheDocument();
  });

  it('shows Remove button when not dirty and not new', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
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
      <PrimerSeqItemInput
        isNew={true}
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('shows Update and Reset buttons when dirty', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const headerInput = screen.getByDisplayValue('Forward_Primer');
    fireEvent.change(headerInput, {target: {value: 'Reverse_Primer'}});

    expect(screen.getByText('Update')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('calls onChange with updated values when Add is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        isNew={true}
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        idx: 0,
        header: 'Forward_Primer',
        sequence: 'ACGTACGT',
        type: 'five-end'
      }),
      true
    );
  });

  it('calls onChange with updated values when Update is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const headerInput = screen.getByDisplayValue('Forward_Primer');
    fireEvent.change(headerInput, {target: {value: 'Updated'}});

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Updated'
      }),
      false
    );
  });

  it('calls onChange with idx when Remove is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
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
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const headerInput = screen.getByDisplayValue('Forward_Primer');
    fireEvent.change(headerInput, {target: {value: 'changed'}});
    expect(screen.getByDisplayValue('changed')).toBeInTheDocument();

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(screen.getByDisplayValue('Forward_Primer')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('changed')).not.toBeInTheDocument();
  });

  it('updates header when input changes', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const headerInput = screen.getByDisplayValue('Forward_Primer');
    fireEvent.change(headerInput, {target: {value: 'NewHeader'}});

    expect(screen.getByDisplayValue('NewHeader')).toBeInTheDocument();
  });

  it('updates sequence when textarea changes', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const seqInput = screen.getByDisplayValue('ACGTACGT');
    fireEvent.change(seqInput, {target: {value: 'TGCATGCA'}});

    expect(screen.getByDisplayValue('TGCATGCA')).toBeInTheDocument();
  });

  it('updates type when radio button changes', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const threeEndRadio = screen.getByLabelText('3′ end only');
    fireEvent.click(threeEndRadio);

    expect(threeEndRadio).toBeChecked();
  });

  it('disables Add/Update button when header is empty', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        isNew={true}
        name="primer"
        value={{...defaultValue, header: ''}}
        onChange={onChange}
      />
    );

    const addButton = screen.getByRole('button', {name: 'Add'});
    expect(addButton).toBeDisabled();
  });

  it('disables Add/Update button when sequence is empty', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        isNew={true}
        name="primer"
        value={{...defaultValue, sequence: ''}}
        onChange={onChange}
      />
    );

    const addButton = screen.getByRole('button', {name: 'Add'});
    expect(addButton).toBeDisabled();
  });

  it('renders all three end type radio options', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    expect(screen.getByLabelText('5′ and 3′ end')).toBeInTheDocument();
    expect(screen.getByLabelText('5′ end only')).toBeInTheDocument();
    expect(screen.getByLabelText('3′ end only')).toBeInTheDocument();
  });

  it('checks the correct end type radio button', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={{...defaultValue, type: 'five-end'}}
        onChange={onChange}
      />
    );

    const fiveEndRadio = screen.getByLabelText('5′ end only') as HTMLInputElement;
    expect(fiveEndRadio.checked).toBe(true);
  });

  it('renders 3-end trimming type options', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const threeEndOptions = screen.getAllByText('regular');
    expect(threeEndOptions.length).toBeGreaterThan(0);
  });

  it('renders 5-end trimming type options', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const anchored = screen.getAllByText('anchored');
    expect(anchored.length).toBeGreaterThan(0);
  });

  it('disables 5-end radio when 3-end type is not regular', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={{...defaultValue, sequence: 'ACGTACGT$', type: 'both-end'}}
        onChange={onChange}
      />
    );

    const fiveEndRadio = screen.getByLabelText('5′ end only') as HTMLInputElement;
    expect(fiveEndRadio.disabled).toBe(true);
  });

  it('disables 3-end radio when 5-end type is not regular', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={{...defaultValue, sequence: '^ACGTACGT', type: 'both-end'}}
        onChange={onChange}
      />
    );

    const threeEndRadio = screen.getByLabelText('3′ end only') as HTMLInputElement;
    expect(threeEndRadio.disabled).toBe(true);
  });

  it('disables 3-end trimming type when type is five-end', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={{...defaultValue, type: 'five-end'}}
        onChange={onChange}
      />
    );

    const threeEndLabel = screen.getByText('3′ end trimming type:');
    const container = threeEndLabel.parentElement;
    const radios = container?.querySelectorAll('input[type="radio"]');

    radios?.forEach(radio => {
      expect(radio).toBeDisabled();
    });
  });

  it('disables 5-end trimming type when type is three-end', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={{...defaultValue, type: 'three-end'}}
        onChange={onChange}
      />
    );

    const fiveEndLabel = screen.getByText('5′ end trimming type:');
    const container = fiveEndLabel.parentElement;
    const radios = container?.querySelectorAll('input[type="radio"]');

    radios?.forEach(radio => {
      expect(radio).toBeDisabled();
    });
  });

  it('disables trimming type options when sequence is too short', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={{...defaultValue, sequence: 'A'}}
        onChange={onChange}
      />
    );

    const threeEndLabel = screen.getByText('3′ end trimming type:');
    const container = threeEndLabel.parentElement;
    const radios = container?.querySelectorAll('input[type="radio"]');

    radios?.forEach(radio => {
      expect(radio).toBeDisabled();
    });
  });

  it('generates correct textarea ID', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="test-primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const textarea = screen.getByDisplayValue('ACGTACGT');
    expect(textarea).toHaveAttribute('id', 'test-primer-0-seq');
  });

  it('sets data-dirty attribute when dirty', () => {
    const onChange = vi.fn();
    const {container} = render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const headerInput = screen.getByDisplayValue('Forward_Primer');
    fireEvent.change(headerInput, {target: {value: 'changed'}});

    const row = container.querySelector('[data-dirty]');
    expect(row).toHaveAttribute('data-dirty', 'true');
  });

  it('updates all fields and saves correctly', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        isNew={true}
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const headerInput = screen.getByDisplayValue('Forward_Primer');
    const seqInput = screen.getByDisplayValue('ACGTACGT');
    const threeEndRadio = screen.getByLabelText('3′ end only');

    fireEvent.change(headerInput, {target: {value: 'Updated_Header'}});
    fireEvent.change(seqInput, {target: {value: 'GGCCGGCC'}});
    fireEvent.click(threeEndRadio);

    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        header: 'Updated_Header',
        sequence: 'GGCCGGCC',
        type: 'three-end'
      }),
      true
    );
  });

  it('handles both-end type selection', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const bothEndRadio = screen.getByLabelText('5′ and 3′ end');
    fireEvent.click(bothEndRadio);

    expect(bothEndRadio).toBeChecked();
  });

  it('renders textarea with placeholder', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={{...defaultValue, sequence: ''}}
        onChange={onChange}
      />
    );

    expect(screen.getByPlaceholderText('Primer sequence')).toBeInTheDocument();
  });

  it('maintains separate state for header, sequence, and type', () => {
    const onChange = vi.fn();
    render(
      <PrimerSeqItemInput
        name="primer"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const headerInput = screen.getByDisplayValue('Forward_Primer');
    const seqInput = screen.getByDisplayValue('ACGTACGT');

    fireEvent.change(headerInput, {target: {value: 'New_Header'}});
    expect(screen.getByDisplayValue('ACGTACGT')).toBeInTheDocument();

    fireEvent.change(seqInput, {target: {value: 'NEWSEQ'}});
    expect(screen.getByDisplayValue('New_Header')).toBeInTheDocument();
  });
});
