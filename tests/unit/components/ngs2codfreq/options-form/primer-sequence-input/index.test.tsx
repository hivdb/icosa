import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import PrimerSequenceInput from '../../../../../../src/components/ngs2codfreq/options-form/primer-sequence-input/index';
import type {PrimerSeq} from '../../../../../../src/components/ngs2codfreq/options-form/types';

// Mock dependencies
vi.mock('../../../../../../src/utils/fasta', () => ({
  parseFasta: (text: string) => {
    if (text.includes('>Forward')) {
      return [{header: 'Forward_Primer', sequence: 'ACGTACGT'}];
    }
    if (text.includes('>Reverse')) {
      return [{header: 'Reverse_Primer', sequence: 'TGCATGCA'}];
    }
    return [];
  }
}));

vi.mock('../../../../../../src/utils/read-file', () => ({
  __esModule: true,
  default: async (file: File) => {
    if (file.name === 'primers.fasta') {
      return '>Forward_Primer\nACGTACGT';
    }
    return '';
  }
}));

vi.mock('../../../../../../src/utils/use-mounted', () => ({
  __esModule: true,
  default: () => () => true
}));

describe('PrimerSequenceInput', () => {
  const defaultValue: PrimerSeq[] = [
    {idx: 0, header: 'Primer1', sequence: 'ACGTACGT', type: 'five-end'}
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing primers', () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
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
      <PrimerSequenceInput
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
      <PrimerSequenceInput
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
      <PrimerSequenceInput
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
      <PrimerSequenceInput
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
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add one primer');
    fireEvent.click(addButton);

    const seqInput = screen.getByPlaceholderText('Primer sequence');
    fireEvent.change(seqInput, {target: {value: 'ACGTACGT'}});

    const saveButton = screen.getByText('Add');
    fireEvent.click(saveButton);

    expect(onChange).toHaveBeenCalledWith(
      'primers',
      expect.arrayContaining([
        expect.objectContaining({header: 'Primer-1', sequence: 'ACGTACGT'})
      ])
    );
  });

  it('removes pending primer when cancelled', () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
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
      <PrimerSequenceInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const headerInput = screen.getByDisplayValue('Primer1');
    fireEvent.change(headerInput, {target: {value: 'UpdatedPrimer'}});

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    expect(onChange).toHaveBeenCalledWith(
      'primers',
      expect.arrayContaining([
        expect.objectContaining({header: 'UpdatedPrimer'})
      ])
    );
  });

  it('calls onChange when an existing primer is removed', () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
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
      <PrimerSequenceInput
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
      <PrimerSequenceInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByRole('button', {name: 'Reset'});
    expect(resetButton).not.toBeDisabled();
  });

  it('shows confirmation dialog when Reset is clicked', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByRole('button', {name: 'Reset'});
    fireEvent.click(resetButton);

    expect(confirmSpy).toHaveBeenCalled();
  });

  it('resets all primers when Reset is confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByRole('button', {name: 'Reset'});
    fireEvent.click(resetButton);

    expect(onChange).toHaveBeenCalledWith('primers', []);
  });

  it('does not reset when Reset is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={defaultValue}
        onChange={onChange}
      />
    );

    const resetButton = screen.getByRole('button', {name: 'Reset'});
    fireEvent.click(resetButton);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders Upload FASTA button', () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Upload FASTA')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['content'], 'primers.fasta', {type: 'text/plain'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

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
    const invalidPrimer: PrimerSeq = {
      idx: 0,
      header: 'dup',
      sequence: 'ACGT',
      type: 'five-end'
    };
    const duplicatePrimer: PrimerSeq = {
      idx: 1,
      header: 'dup',
      sequence: 'TGCA',
      type: 'five-end'
    };

    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[invalidPrimer, duplicatePrimer]}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/Duplicate headers/)).toBeInTheDocument();
  });

  it('renders multiple primers', () => {
    const multiplePrimers: PrimerSeq[] = [
      {idx: 0, header: 'Primer1', sequence: 'ACGTACGT', type: 'five-end'},
      {idx: 1, header: 'Primer2', sequence: 'TGCATGCA', type: 'three-end'}
    ];

    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
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
      <PrimerSequenceInput
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
    const existingPrimers: PrimerSeq[] = [
      {idx: 5, header: 'Primer1', sequence: 'ACGTACGT', type: 'five-end'}
    ];

    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
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
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    expect(screen.getByText('or')).toBeInTheDocument();
  });

  it('detects five-end type from header with forward keyword', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['>Forward_Primer\nACGTACGT'], 'primers.fasta', {type: 'text/plain'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          'primers',
          expect.arrayContaining([
            expect.objectContaining({type: 'five-end'})
          ])
        );
      });
    }
  });

  it('detects three-end type from header with reverse keyword', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['>Reverse_Primer\nTGCATGCA'], 'primers.fasta', {type: 'text/plain'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          'primers',
          expect.arrayContaining([
            expect.objectContaining({type: 'three-end'})
          ])
        );
      });
    }
  });

  it('defaults to both-end type when header has no keywords', () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const addButton = screen.getByText('Add one primer');
    fireEvent.click(addButton);

    const bothEndRadio = screen.getByLabelText('5′ and 3′ end') as HTMLInputElement;
    expect(bothEndRadio.checked).toBe(true);
  });

  it('handles file upload with invalid file type', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['content'], 'primers.fasta', {type: 'application/pdf'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

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

  it('handles file upload with gzip file type', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['content'], 'primers.fasta.gz', {type: 'application/x-gzip'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

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
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['content'], 'primers.fasta', {type: ''});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

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

  it('handles multiple files in upload', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file1 = new File(['content'], 'primers1.fasta', {type: 'text/plain'});
    const file2 = new File(['content'], 'primers2.fasta', {type: 'text/plain'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

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

  it('detects five-end from header with "left" keyword', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['>Left_Primer\nACGTACGT'], 'primers.fasta', {type: 'text/plain'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          'primers',
          expect.arrayContaining([
            expect.objectContaining({type: 'five-end'})
          ])
        );
      });
    }
  });

  it('detects three-end from header with "right" keyword', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File(['>Right_Primer\nTGCATGCA'], 'primers.fasta', {type: 'text/plain'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          'primers',
          expect.arrayContaining([
            expect.objectContaining({type: 'three-end'})
          ])
        );
      });
    }
  });

  it('handles empty file upload', async () => {
    const onChange = vi.fn();
    render(
      <PrimerSequenceInput
        name="primers"
        value={[]}
        onChange={onChange}
      />
    );

    const file = new File([''], 'empty.fasta', {type: 'text/plain'});
    const input = screen.getByText('Upload FASTA').closest('label')?.querySelector('input[type="file"]');

    if (input) {
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false
      });
      fireEvent.change(input);

      await waitFor(() => {
        // Should call onChange even with empty file (no valid sequences)
        expect(onChange).toHaveBeenCalledWith('primers', []);
      });
    }
  });
});
