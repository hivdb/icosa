import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const mockPush = vi.fn();

vi.mock('found', () => ({
  useRouter: () => ({router: {push: mockPush, replace: vi.fn()}, match: {location: {}}})
}));

vi.mock('../../../../src/utils/read-file', () => ({
  default: vi.fn().mockResolvedValue('>seq1\nATGC')
}));

vi.mock('../../../../src/utils/big-data', () => ({
  default: {
    clear: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue('big-data-key')
  }
}));

import SequenceInputForm from '../../../../src/components/analyze-forms/sequence-input-form';
import readFile from '../../../../src/utils/read-file';

describe('SequenceInputForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sequence input elements', () => {
    render(<SequenceInputForm to="/analyze" />);
    expect(screen.getByText('Upload text file:')).toBeTruthy();
    expect(screen.getAllByRole('textbox').length).toBeGreaterThan(0);
  });

  it('renders with children at top placement', () => {
    render(
      <SequenceInputForm to="/analyze" childrenPlacement="top">
        <div>Top Content</div>
      </SequenceInputForm>
    );
    expect(screen.getByText('Top Content')).toBeTruthy();
  });

  it('renders with children at bottom placement', () => {
    render(
      <SequenceInputForm to="/analyze" childrenPlacement="bottom">
        <div>Bottom Content</div>
      </SequenceInputForm>
    );
    expect(screen.getByText('Bottom Content')).toBeTruthy();
  });

  it('updates header input', () => {
    render(<SequenceInputForm to="/analyze" />);
    const headerInput = document.querySelector('input[name="header"]') as HTMLInputElement;
    
    fireEvent.change(headerInput, {target: {value: 'Test Header'}});
    expect(headerInput).toHaveValue('Test Header');
  });

  it('updates sequence textarea', async () => {
    const user = userEvent.setup({delay: null});
    render(<SequenceInputForm to="/analyze" />);
    const sequenceInput = document.querySelector('textarea[class*="sequence-input"]') as HTMLTextAreaElement;
    
    await user.type(sequenceInput, '>seq1{Enter}ATGC');
    expect(sequenceInput).toHaveValue('>seq1\nATGC');
  });

  it('handles file upload', async () => {
    render(<SequenceInputForm to="/analyze" />);
    
    const file = new File(['>seq1\nATGC'], 'test.fasta', {type: 'text/plain'});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(fileInput, {target: {files: [file]}});
    
    await waitFor(() => {
      expect(readFile).toHaveBeenCalledWith(file);
    });
  });

  it('rejects non-text file types', async () => {
    render(<SequenceInputForm to="/analyze" />);
    
    const file = new File(['data'], 'test.jpg', {type: 'image/jpeg'});
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    fireEvent.change(fileInput, {target: {files: [file]}});
    
    expect(readFile).not.toHaveBeenCalled();
  });

  it('shows Load Examples link when examples provided', () => {
    const exampleFasta = [{url: '/example.fasta', title: 'Example 1'}];
    render(<SequenceInputForm to="/analyze" exampleFasta={exampleFasta} />);
    
    expect(screen.getByText('Load Examples')).toBeTruthy();
  });

  it('loads single example directly when clicked', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('>example\nATGC')
    });
    
    const exampleFasta = [{url: '/example.fasta', title: 'Example 1'}];
    render(<SequenceInputForm to="/analyze" exampleFasta={exampleFasta} />);
    
    const loadLink = screen.getByText('Load Examples');
    fireEvent.click(loadLink);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/example.fasta');
    });
  });

  it('shows example list when multiple examples provided', async () => {
    const exampleFasta = [
      {url: '/example1.fasta', title: 'Example 1'},
      {url: '/example2.fasta', title: 'Example 2'}
    ];
    render(<SequenceInputForm to="/analyze" exampleFasta={exampleFasta} />);
    
    const loadLink = screen.getByText('Load Examples');
    fireEvent.click(loadLink);
    
    await waitFor(() => {
      expect(screen.getByText('Example 1')).toBeTruthy();
      expect(screen.getByText('Example 2')).toBeTruthy();
    });
  });

  it('loads selected example from list', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      text: () => Promise.resolve('>example2\nGGCC')
    });
    
    const exampleFasta = [
      {url: '/example1.fasta', title: 'Example 1'},
      {url: '/example2.fasta', title: 'Example 2'}
    ];
    render(<SequenceInputForm to="/analyze" exampleFasta={exampleFasta} />);
    
    const loadLink = screen.getByText('Load Examples');
    fireEvent.click(loadLink);
    
    await waitFor(() => screen.getByText('Example 2'));
    
    const example2Link = screen.getByText('Example 2');
    fireEvent.click(example2Link);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/example2.fasta');
    });
  });

  it('renders output options when provided', () => {
    const outputOptions = {
      json: {label: 'JSON'},
      csv: {label: 'CSV'}
    };
    render(<SequenceInputForm to="/analyze" outputOptions={outputOptions} />);
    
    expect(screen.getByText('Output options')).toBeTruthy();
    expect(screen.getByText('JSON')).toBeTruthy();
    expect(screen.getByText('CSV')).toBeTruthy();
  });

  it('changes output option selection', () => {
    const outputOptions = {
      json: {label: 'JSON'},
      csv: {label: 'CSV'}
    };
    render(<SequenceInputForm to="/analyze" outputOptions={outputOptions} />);
    
    const csvRadio = screen.getByLabelText('CSV');
    fireEvent.click(csvRadio);
    
    expect(csvRadio).toBeChecked();
  });

  it('renders sub-options when output option has them', () => {
    const outputOptions = {
      custom: {
        label: 'Custom',
        subOptions: ['Option 1', 'Option 2'],
        defaultSubOptions: [0]
      }
    };
    render(<SequenceInputForm to="/analyze" outputOptions={outputOptions} />);
    
    const customRadio = screen.getByLabelText('Custom');
    fireEvent.click(customRadio);
    
    expect(screen.getByText('Option 1')).toBeTruthy();
    expect(screen.getByText('Option 2')).toBeTruthy();
  });

  it('toggles sub-option checkboxes', () => {
    const outputOptions = {
      custom: {
        label: 'Custom',
        subOptions: ['Option 1', 'Option 2'],
        defaultSubOptions: [0]
      }
    };
    render(<SequenceInputForm to="/analyze" outputOptions={outputOptions} />);
    
    const customRadio = screen.getByLabelText('Custom');
    fireEvent.click(customRadio);
    
    const option2Checkbox = screen.getByLabelText('Option 2');
    fireEvent.click(option2Checkbox);
    
    expect(option2Checkbox).toBeChecked();
    
    fireEvent.click(option2Checkbox);
    expect(option2Checkbox).not.toBeChecked();
  });

  it('submits form with default output option', async () => {
    const user = userEvent.setup({delay: null});
    render(<SequenceInputForm to="/analyze" />);
    
    const sequenceInput = document.querySelector('textarea[class*="sequence-input"]') as HTMLTextAreaElement;
    await user.type(sequenceInput, '>seq1{Enter}ATGC');
    
    const submitButton = screen.getByRole('button', {name: /analyze/i});
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it('calls onSubmit callback when provided', async () => {
    const user = userEvent.setup({delay: null});
    const onSubmit = vi.fn().mockResolvedValue([true, {}, {}]);
    render(<SequenceInputForm to="/analyze" onSubmit={onSubmit} />);
    
    const sequenceInput = document.querySelector('textarea[class*="sequence-input"]') as HTMLTextAreaElement;
    await user.type(sequenceInput, '>seq1{Enter}ATGC');
    
    const submitButton = screen.getByRole('button', {name: /analyze/i});
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('uses custom header when provided', async () => {
    const user = userEvent.setup({delay: null});
    const onSubmit = vi.fn().mockResolvedValue([true, {}, {}]);
    render(<SequenceInputForm to="/analyze" onSubmit={onSubmit} />);
    
    const headerInput = document.querySelector('input[name="header"]') as HTMLInputElement;
    await user.type(headerInput, 'Custom Header');
    
    const sequenceInput = document.querySelector('textarea[class*="sequence-input"]') as HTMLTextAreaElement;
    await user.type(sequenceInput, '>seq1{Enter}ATGC');
    
    const submitButton = screen.getByRole('button', {name: /analyze/i});
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      const sequences = onSubmit.mock.calls[0][1];
      expect(sequences[0].header).toBe('Custom Header');
    });
  });

  it('handles custom output option with renderer', async () => {
    const user = userEvent.setup({delay: null});
    const mockRenderer = vi.fn(() => <div>Custom Output</div>);
    const outputOptions = {
      custom: {
        label: 'Custom',
        renderer: mockRenderer
      }
    };
    render(<SequenceInputForm to="/analyze" outputOptions={outputOptions} />);
    
    const customRadio = screen.getByLabelText('Custom');
    await user.click(customRadio);
    
    const sequenceInput = document.querySelector('textarea[class*="sequence-input"]') as HTMLTextAreaElement;
    await user.type(sequenceInput, '>seq1{Enter}ATGC');
    
    const submitButton = screen.getByRole('button', {name: /analyze/i});
    expect(submitButton).not.toBeDisabled();
    
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockRenderer).toHaveBeenCalled();
    });
  });

  it('resets form when reset button clicked', async () => {
    const user = userEvent.setup({delay: null});
    render(<SequenceInputForm to="/analyze" />);
    
    const headerInput = document.querySelector('input[name="header"]') as HTMLInputElement;
    await user.type(headerInput, 'Test');
    
    const sequenceInput = document.querySelector('textarea[class*="sequence-input"]') as HTMLTextAreaElement;
    await user.type(sequenceInput, 'ATGC');
    
    const resetButton = screen.getByRole('button', {name: /reset/i});
    await user.click(resetButton);
    
    await waitFor(() => {
      expect(headerInput).toHaveValue('');
      expect(sequenceInput).toHaveValue('');
    });
  });

  it('disables submit button when no sequence provided', () => {
    render(<SequenceInputForm to="/analyze" />);
    
    const submitButton = screen.getByRole('button', {name: /analyze/i});
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when sequence provided', async () => {
    const user = userEvent.setup({delay: null});
    render(<SequenceInputForm to="/analyze" />);
    
    const sequenceInput = document.querySelector('textarea[class*="sequence-input"]') as HTMLTextAreaElement;
    await user.type(sequenceInput, 'ATGC');
    
    const submitButton = screen.getByRole('button', {name: /analyze/i});
    expect(submitButton).not.toBeDisabled();
  });

  it('disables reset button when form is empty', () => {
    render(<SequenceInputForm to="/analyze" />);
    
    const resetButton = screen.getByRole('button', {name: /reset/i});
    expect(resetButton).toBeDisabled();
  });
});

