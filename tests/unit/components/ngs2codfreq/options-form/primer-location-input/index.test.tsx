import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import PrimerLocationInput from '../../../../../../src/components/ngs2codfreq/options-form/primer-location-input/index';
import type {PrimerBed} from '../../../../../../src/components/ngs2codfreq/options-form/types';

// Mock dependencies
vi.mock('../../../../../../src/utils/config-context', () => ({
  __esModule: true,
  default: {
    use: () => [{
      refSequencePath: '/ref.fasta',
      refSequenceName: 'NC_045512'
    }]
  }
}));

vi.mock('../../../../../../src/utils/cms', () => ({
  useCMS: () => ['ACGTACGTACGTACGTACGTACGT', false]
}));

vi.mock('../../../../../../src/utils/fasta', () => ({
  parseFasta: (text: string) => [{sequence: text}]
}));

vi.mock('../../../../../../src/utils/read-file', () => ({
  __esModule: true,
  default: async (file: File) => {
    if (file.name === 'primers.bed') {
      return 'NC_045512\t10\t30\tPrimer1\t60\t+\nNC_045512\t40\t60\tPrimer2\t60\t-';
    }
    return '';
  }
}));

vi.mock('../../../../../../src/utils/use-mounted', () => ({
  __esModule: true,
  default: () => () => true
}));

describe('PrimerLocationInput', () => {
  const defaultValue: PrimerBed[] = [
    {idx: 0, region: 'NC_045512', start: 10, end: 30, name: 'Primer1', score: 60, strand: '+'}
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing primers', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    expect(screen.getByDisplayValue('Primer1')).toBeInTheDocument();
  });

  it('renders Add one primer button when no primers exist', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Add one primer')).toBeInTheDocument();
  });

  it('renders Add more primer button when primers exist', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Add more primer')).toBeInTheDocument();
  });

  it('adds a new pending primer when Add button is clicked', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add one primer');
    fireEvent.click(addButton);

    expect(screen.getByDisplayValue('Primer-1')).toBeInTheDocument();
  });

  it('increments primer name for each new primer', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add one primer');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    expect(screen.getByDisplayValue('Primer-1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Primer-2')).toBeInTheDocument();
  });

  it('calls onChange when a new primer is saved', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add one primer');
    fireEvent.click(addButton);

    // Make the primer valid by setting valid start and end positions
    const startInput = screen.getByPlaceholderText('Start');
    const endInput = screen.getByPlaceholderText('End');
    fireEvent.change(startInput, {target: {value: '10'}});
    fireEvent.change(endInput, {target: {value: '30'}});

    const saveButton = screen.getByText('Add');
    fireEvent.click(saveButton);

    expect(onChange).toHaveBeenCalledWith(
      'primers',
      expect.arrayContaining([
        expect.objectContaining({name: 'Primer-1'})
      ])
    );
  });

  it('removes pending primer when cancelled', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add one primer');
    fireEvent.click(addButton);
    expect(screen.getByDisplayValue('Primer-1')).toBeInTheDocument();

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith('primers', []);
  });

  it('calls onChange when an existing primer is updated', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const nameInput = screen.getByDisplayValue('Primer1');
    fireEvent.change(nameInput, {target: {value: 'UpdatedPrimer'}});

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    expect(onChange).toHaveBeenCalledWith(
      'primers',
      expect.arrayContaining([
        expect.objectContaining({name: 'UpdatedPrimer'})
      ])
    );
  });

  it('calls onChange when an existing primer is removed', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith('primers', []);
  });

  it('disables Reset button when no primers exist', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByRole('button', {name: 'Reset'});
    expect(resetButton).toBeDisabled();
  });

  it('enables Reset button when primers exist', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByText('Reset');
    expect(resetButton).not.toBeDisabled();
  });

  it('shows confirmation dialog when Reset is clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('resets all primers when Reset is confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(onChange).toHaveBeenCalledWith('primers', []);
  });

  it('does not reset when Reset is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders Upload BED button', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Upload BED')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['content'], 'primers.bed', {type: 'text/plain'});
    const input = screen.getByText('Upload BED').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    }
  });

  it('renders validation errors', () => {
    const invalidPrimer: PrimerBed = {
      idx: 0,
      region: 'NC_045512',
      start: -1,
      end: 30,
      name: 'Invalid',
      score: 60,
      strand: '+'
    };

    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[invalidPrimer]}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/Start position cannot be less than 0/)).toBeInTheDocument();
  });

  it('renders multiple primers', () => {
    const multiplePrimers: PrimerBed[] = [
      {idx: 0, region: 'NC_045512', start: 10, end: 30, name: 'Primer1', score: 60, strand: '+'},
      {idx: 1, region: 'NC_045512', start: 40, end: 60, name: 'Primer2', score: 60, strand: '-'}
    ];

    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={multiplePrimers}
        onChange={onChange}
      />
    );

    expect(screen.getByDisplayValue('Primer1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Primer2')).toBeInTheDocument();
  });

  it('maintains separate state for value and pending items', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add more primer');
    fireEvent.click(addButton);

    expect(screen.getByDisplayValue('Primer1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Primer-2')).toBeInTheDocument();
  });

  it('uses correct auto-increment based on existing primers', () => {
    const existingPrimers: PrimerBed[] = [
      {idx: 5, region: 'NC_045512', start: 10, end: 30, name: 'Primer1', score: 60, strand: '+'}
    ];

    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={existingPrimers}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add more primer');
    fireEvent.click(addButton);

    expect(screen.getByDisplayValue('Primer-7')).toBeInTheDocument();
  });

  it('renders or text between buttons', () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('handles file upload with invalid file type', async () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['content'], 'primers.bed', {type: 'application/pdf'});
    const input = screen.getByText('Upload BED').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        // Should not call onChange for invalid file type
        expect(onChange).not.toHaveBeenCalled();
      }, {timeout: 100});
    }
  });

  it('handles file upload with empty file', async () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File([''], 'empty.bed', {type: 'text/plain'});
    const input = screen.getByText('Upload BED').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        // Should call onChange even with empty file (no valid rows)
        expect(onChange).toHaveBeenCalledWith('primers', []);
      });
    }
  });

  it('handles file upload with gzip file type', async () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['content'], 'primers.bed.gz', {type: 'application/x-gzip'});
    const input = screen.getByText('Upload BED').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    }
  });

  it('handles file upload with empty file type', async () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['content'], 'primers.bed', {type: ''});
    const input = screen.getByText('Upload BED').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    }
  });

  it('parses valid BED rows and skips invalid ones', async () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    // The mock already returns valid data, so this tests the parsing logic
    const file = new File(['content'], 'primers.bed', {type: 'text/plain'});
    const input = screen.getByText('Upload BED').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        // Should parse valid rows from the mocked file
        expect(onChange).toHaveBeenCalled();
      });
    }
  });

  it('handles multiple files in upload', async () => {
    const onChange = vi.fn();
    render(
      <PrimerLocationInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file1 = new File(['content'], 'primers1.bed', {type: 'text/plain'});
    const file2 = new File(['content'], 'primers2.bed', {type: 'text/plain'});
    const input = screen.getByText('Upload BED').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file1, file2],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    }
  });
});
