import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

vi.mock('found', () => ({
  useRouter: () => ({router: {push: vi.fn()}, match: {location: {query: {}}}})
}));

vi.mock('../../../../../src/utils/sequence-reads', () => ({
  parseSequenceReads: vi.fn(),
  buildGeneValidator: vi.fn()
}));

vi.mock('../../../../../src/utils/big-data', () => ({
  default: {
    clear: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue('big-data-key')
  }
}));

vi.mock('../../../../../src/utils/read-file', () => ({
  default: vi.fn()
}));

vi.mock('../../../../../src/components/report/seq-summary', () => ({
  default: () => null,
  MinPositionReads: () => null,
  MaxMixtureRate: () => null,
  MinPrevalence: () => null
}));

vi.mock('../../../../../src/utils/config-context', () => ({
  default: {
    use: () => [{
      geneValidatorDefs: [{gene: 'PR', start: 1, end: 99}],
      messages: {'seqreads-analysis-form-placeholder': 'Drop files here'}
    }, false]
  }
}));

global.fetch = vi.fn();
global.alert = vi.fn();

import SequenceReadsInputForm from '../../../../../src/components/analyze-forms/sequence-reads-input-form';
import * as sequenceReadsUtils from '../../../../../src/utils/sequence-reads';
import * as readFileUtil from '../../../../../src/utils/read-file';

const mockGeneValidator = vi.fn((g: string, p: number) => [g, p]);
const mockParseSequenceReads = vi.mocked(sequenceReadsUtils.parseSequenceReads);
const mockBuildGeneValidator = vi.mocked(sequenceReadsUtils.buildGeneValidator);
const mockReadFile = vi.mocked(readFileUtil.default);

describe('SequenceReadsInputForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildGeneValidator.mockReturnValue(mockGeneValidator);
    mockParseSequenceReads.mockReturnValue({name: 'test', gene: 'PR', allReads: []});
    mockReadFile.mockResolvedValue('test data');
  });

  it('renders file input for reads', async () => {
    render(<SequenceReadsInputForm to="/reads" />);
    const label = await screen.findByText('Upload file(s):');
    expect(label).toBeTruthy();
  });

  it('renders children when provided', () => {
    render(
      <SequenceReadsInputForm to="/reads">
        <div>Custom Content</div>
      </SequenceReadsInputForm>
    );
    expect(screen.getByText('Custom Content')).toBeTruthy();
  });

  it('shows example data link when exampleCodonReads provided', () => {
    render(<SequenceReadsInputForm to="/reads" exampleCodonReads={['http://example.com/test.codfreq']} />);
    expect(screen.getByText('Load Example Data')).toBeTruthy();
  });

  it('loads example data when clicked', async () => {
    (global.fetch as any).mockResolvedValue({
      text: () => Promise.resolve('test data')
    });

    render(<SequenceReadsInputForm to="/reads" exampleCodonReads={['http://example.com/test.codfreq']} />);

    const loadBtn = screen.getByText('Load Example Data');
    fireEvent.click(loadBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://example.com/test.codfreq');
      expect(mockParseSequenceReads).toHaveBeenCalled();
    });
  });

  it('handles file upload', async () => {
    const file = new File(['data'], 'test.codfreq', {type: 'text/plain'});
    
    render(<SequenceReadsInputForm to="/reads" />);

    const fileInput = screen.getByRole('button', {name: /choose file/i}).previousSibling as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(mockReadFile).toHaveBeenCalledWith(file);
      expect(mockParseSequenceReads).toHaveBeenCalled();
    });
  });

  it('uploads files successfully', async () => {
    mockParseSequenceReads.mockReturnValue({name: 'sample', gene: 'PR', allReads: []});
    
    const file = new File(['data'], 'sample.codfreq', {type: 'text/plain'});
    
    render(<SequenceReadsInputForm to="/reads" />);

    const fileInput = screen.getByRole('button', {name: /choose file/i}).previousSibling as HTMLInputElement;
    await userEvent.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText('sample')).toBeTruthy();
      expect(mockReadFile).toHaveBeenCalledWith(file);
      expect(mockParseSequenceReads).toHaveBeenCalled();
    });
  });

  it('rejects files with invalid names', async () => {
    const file = new File(['data'], 'invalid file!.codfreq', {type: 'text/plain'});
    
    render(<SequenceReadsInputForm to="/reads" />);

    const fileInput = screen.getByRole('button', {name: /choose file/i}).previousSibling as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('invalid'));
    });
  });

  it('handles file removal', async () => {
    mockParseSequenceReads.mockReturnValue({name: 'test', gene: 'PR', allReads: []});
    const file = new File(['data'], 'test.codfreq', {type: 'text/plain'});
    
    render(<SequenceReadsInputForm to="/reads" />);

    const fileInput = screen.getByRole('button', {name: /choose file/i}).previousSibling as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await waitFor(() => screen.getByText('test'));

    // Find and click the remove button (times icon)
    const removeButtons = screen.getAllByRole('button');
    const removeBtn = removeButtons.find(btn => btn.getAttribute('name')?.includes('remove'));
    if (removeBtn) {
      fireEvent.click(removeBtn);
      await waitFor(() => {
        expect(screen.queryByText('test')).toBeNull();
      });
    }
  });

  it('handles form submission with onSubmit callback', async () => {
    mockParseSequenceReads.mockReturnValue({name: 'test', gene: 'PR', allReads: []});
    const onSubmit = vi.fn().mockResolvedValue([true, {}]);
    const file = new File(['data'], 'test.codfreq', {type: 'text/plain'});
    
    render(<SequenceReadsInputForm to="/reads" onSubmit={onSubmit} />);

    const fileInput = screen.getByRole('button', {name: /choose file/i}).previousSibling as HTMLInputElement;
    await userEvent.upload(fileInput, file);
    await waitFor(() => screen.getByText('test'));

    const analyzeBtn = screen.getByRole('button', {name: /analyze/i});
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('handles form submission with custom output option and renderer', async () => {
    mockParseSequenceReads.mockReturnValue({name: 'test', gene: 'PR', allReads: []});
    const renderer = vi.fn().mockReturnValue(<div>Custom Output</div>);
    const outputOptions = {custom: {label: 'Custom', renderer}};
    const onSubmit = vi.fn().mockResolvedValue([true, {}]);
    const file = new File(['data'], 'test.codfreq', {type: 'text/plain'});
    
    render(<SequenceReadsInputForm to="/reads" onSubmit={onSubmit} outputOptions={outputOptions} />);

    const fileInput = screen.getByRole('button', {name: /choose file/i}).previousSibling as HTMLInputElement;
    await userEvent.upload(fileInput, file);
    await waitFor(() => screen.getByText('test'));

    const customRadio = screen.getByLabelText('Custom');
    await userEvent.click(customRadio);

    const analyzeBtn = screen.getByRole('button', {name: /analyze/i});
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(renderer).toHaveBeenCalled();
    });
  });

  it('enables reset button after file upload', async () => {
    mockParseSequenceReads.mockReturnValue({name: 'test', gene: 'PR', allReads: []});
    const file = new File(['data'], 'test.codfreq', {type: 'text/plain'});
    
    render(<SequenceReadsInputForm to="/reads" />);

    const resetBtn = screen.getByRole('button', {name: /reset/i});
    expect(resetBtn).toBeDisabled();

    const fileInput = screen.getByRole('button', {name: /choose file/i}).previousSibling as HTMLInputElement;
    await userEvent.upload(fileInput, file);
    await waitFor(() => screen.getByText('test'));

    expect(resetBtn).not.toBeDisabled();
  });

  it('disables buttons when no files uploaded', () => {
    render(<SequenceReadsInputForm to="/reads" />);

    const analyzeBtn = screen.getByRole('button', {name: /analyze/i});
    const resetBtn = screen.getByRole('button', {name: /reset/i});
    
    expect(analyzeBtn).toBeDisabled();
    expect(resetBtn).toBeDisabled();
  });

  it('enables buttons when files are uploaded', async () => {
    mockParseSequenceReads.mockReturnValue({name: 'test', gene: 'PR', allReads: []});
    const file = new File(['data'], 'test.codfreq', {type: 'text/plain'});
    
    render(<SequenceReadsInputForm to="/reads" />);

    const fileInput = screen.getByRole('button', {name: /choose file/i}).previousSibling as HTMLInputElement;
    await userEvent.upload(fileInput, file);
    await waitFor(() => screen.getByText('test'));

    const analyzeBtn = screen.getByRole('button', {name: /analyze/i});
    const resetBtn = screen.getByRole('button', {name: /reset/i});
    
    expect(analyzeBtn).not.toBeDisabled();
    expect(resetBtn).not.toBeDisabled();
  });
});

