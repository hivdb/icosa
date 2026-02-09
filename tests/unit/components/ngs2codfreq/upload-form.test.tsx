import {describe, test, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import ConfigContext from '../../../../src/utils/config-context';
import NGSUploadForm from '../../../../src/components/ngs2codfreq/upload-form';
import type {FastqPair} from '../../../../src/components/ngs2codfreq/types';

vi.mock('../../../../src/components/link', () => ({default: ({children}: {children: React.ReactNode}) => <a>{children}</a>}));
vi.mock('../../../../src/components/loader', () => ({default: ({inline}: {inline?: boolean}) => <div data-testid="loader">Loading...</div>}));
vi.mock('../../../../src/components/ngs2codfreq/preview-files', () => ({
  default: ({fastqPairs, onChange}: {fastqPairs: FastqPair[]; onChange: (pairs: FastqPair[]) => void}) => (
    <div data-testid="preview-files">{fastqPairs.length} pairs</div>
  )
}));

vi.mock('../../../../src/utils/config-context', () => {
  const mockConfig = {
    messages: {'ngs2codfreq-placeholder': 'Drop FASTQ files here'},
    refSequencePath: '',
    refSequenceName: 'Ref'
  };
  return {
    default: {
      use: () => [mockConfig, false] as const,
      Provider: ({children}: {children: React.ReactNode}) => <>{children}</>
    }
  };
});

function Wrapper({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}

describe('NGSUploadForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders placeholder text from config', async () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(await screen.findByText(/Drop FASTQ files here/i)).toBeInTheDocument();
  });

  test('renders browse files button', async () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(await screen.findByText(/Browse files/i)).toBeInTheDocument();
  });

  test('shows default options message when isOptionsDefault is true', () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(screen.getByText(/Default filter\/trimming options will be applied/i)).toBeInTheDocument();
  });

  test('shows non-default options message when isOptionsDefault is false', () => {
    render(<NGSUploadForm isOptionsDefault={false} showOptionsForm={false} />, {wrapper: Wrapper});
    expect(screen.getByText(/Non-default customized filter\/trimming options will be applied/i)).toBeInTheDocument();
  });

  test('hides options detail when showOptionsForm is true', () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm />, {wrapper: Wrapper});
    expect(screen.queryByText(/Default filter\/trimming options/i)).not.toBeInTheDocument();
  });

  test('renders link to settings page', () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(screen.getByText(/Click here/i)).toBeInTheDocument();
  });

  test('renders submit button', () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(screen.getByText(/Start process/i)).toBeInTheDocument();
  });

  test('renders reset button', () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(screen.getByText(/Reset/i)).toBeInTheDocument();
  });

  test('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn();
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} onSubmit={onSubmit} />, {wrapper: Wrapper});
    
    const submitButton = screen.getByText(/Start process/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith([]);
    });
  });

  test('does not call onSubmit when not provided', async () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    
    const submitButton = screen.getByText(/Start process/i);
    expect(() => fireEvent.click(submitButton)).not.toThrow();
  });

  test('displays file count', () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(screen.getByText(/0 files/i)).toBeInTheDocument();
  });

  test('renders preview files component', () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(screen.getByTestId('preview-files')).toBeInTheDocument();
  });

  test('sets data-num-pairs attribute', () => {
    const {container} = render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('data-num-pairs', '0');
  });

  test('file input accepts FASTQ formats', () => {
    const {container} = render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'chemical/seq-na-fastq,.fastq,application/gzip,.fastq.gz');
    expect(input).toHaveAttribute('multiple');
  });

  test('renders dropzone with correct structure', () => {
    const {container} = render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    const dropzone = container.querySelector('[role="presentation"]');
    expect(dropzone).toBeInTheDocument();
    expect(dropzone).toHaveAttribute('tabindex', '0');
  });

  test('handles reset button click', async () => {
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    
    const resetButton = screen.getByText(/Reset/i);
    fireEvent.click(resetButton);
    
    await waitFor(() => {
      expect(screen.getByText(/0 files/i)).toBeInTheDocument();
    });
  });

  test('applies custom className', () => {
    const {container} = render(<NGSUploadForm isOptionsDefault showOptionsForm={false} className="custom-class" />, {wrapper: Wrapper});
    expect(container.querySelector('.custom-class__form')).toBeInTheDocument();
  });

  test('shows loader when config is pending', () => {
    const ConfigContextMock = vi.mocked(ConfigContext);
    ConfigContextMock.use = vi.fn(() => [{messages: {}}, true] as const);
    
    render(<NGSUploadForm isOptionsDefault showOptionsForm={false} />, {wrapper: Wrapper});
    expect(screen.getByTestId('loader')).toBeInTheDocument();
    
    ConfigContextMock.use = vi.fn(() => [{messages: {'ngs2codfreq-placeholder': 'Drop FASTQ files here'}}, false] as const);
  });
});
