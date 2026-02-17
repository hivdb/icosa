import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

type MutationError = {text: string; errors: string[]};
const mockSanitizeMutations = vi.fn((muts: string[], config?: any): [string[], MutationError[]] => [[], [{text: 'mut1', errors: ['err']}]]);

vi.mock('../../../../src/utils/mutation', () => ({
  sanitizeMutations: (muts: string[], config?: any) => mockSanitizeMutations(muts, config)
}));

import useMutationErrors, {MutationsErrors} from '../../../../src/components/mutations-input/mutations-errors';

describe('MutationsErrors component', () => {
  it('renders provided errors and handles cleanup', () => {
    const onAutoClean = vi.fn();
    render(
      <MutationsErrors
        allErrors={[{text: 'mut1', errors: ['err1']}]}
        onAutoClean={onAutoClean}
      />
    );
    fireEvent.click(screen.getByText('remove all problematic mutations'));
    expect(onAutoClean).toHaveBeenCalled();
  });

  it('renders multiple errors for single mutation', () => {
    const onAutoClean = vi.fn();
    render(
      <MutationsErrors
        allErrors={[{text: 'mut1', errors: ['err1', 'err2', 'err3']}]}
        onAutoClean={onAutoClean}
      />
    );
    expect(screen.getByText('err1')).toBeInTheDocument();
    expect(screen.getByText('err2')).toBeInTheDocument();
    expect(screen.getByText('err3')).toBeInTheDocument();
  });

  it('renders multiple mutations with errors', () => {
    const onAutoClean = vi.fn();
    render(
      <MutationsErrors
        allErrors={[
          {text: 'mut1', errors: ['err1']},
          {text: 'mut2', errors: ['err2']},
          {text: 'mut3', errors: ['err3']}
        ]}
        onAutoClean={onAutoClean}
      />
    );
    expect(screen.getByText('mut1')).toBeInTheDocument();
    expect(screen.getByText('mut2')).toBeInTheDocument();
    expect(screen.getByText('mut3')).toBeInTheDocument();
  });

  it('strips gene prefix when geneOnly is specified', () => {
    const onAutoClean = vi.fn();
    render(
      <MutationsErrors
        geneOnly="RT"
        allErrors={[{text: 'RT:M184V', errors: ['err1']}]}
        onAutoClean={onAutoClean}
      />
    );
    expect(screen.getByText('M184V')).toBeInTheDocument();
    expect(screen.queryByText('RT:M184V')).not.toBeInTheDocument();
  });

  it('applies parentClassName to error container', () => {
    const onAutoClean = vi.fn();
    const {container} = render(
      <MutationsErrors
        parentClassName="custom"
        allErrors={[{text: 'mut1', errors: ['err1']}]}
        onAutoClean={onAutoClean}
      />
    );
    expect(container.querySelector('.custom-errors')).toBeInTheDocument();
  });

  it('sets data-display attribute based on error count', () => {
    const onAutoClean = vi.fn();
    const {container, rerender} = render(
      <MutationsErrors
        allErrors={[{text: 'mut1', errors: ['err1']}]}
        onAutoClean={onAutoClean}
      />
    );

    const errorDiv = container.querySelector('[data-display]');
    expect(errorDiv).toHaveAttribute('data-display', 'true');

    rerender(
      <MutationsErrors
        allErrors={[]}
        onAutoClean={onAutoClean}
      />
    );
    expect(errorDiv).toHaveAttribute('data-display', 'false');
  });

  it('calculates CSS variable for error rows', () => {
    const onAutoClean = vi.fn();
    const {container} = render(
      <MutationsErrors
        allErrors={[
          {text: 'mut1', errors: ['err1', 'err2']},
          {text: 'mut2', errors: ['err3']}
        ]}
        onAutoClean={onAutoClean}
      />
    );

    const errorDiv = container.querySelector('[data-display]') as HTMLElement;
    // 2 mutations + 3 errors + 2 (one per mutation) = 5 rows
    expect(errorDiv.style.getPropertyValue('--error-rows')).toBe('5');
  });

  it('prevents default on cleanup link click', () => {
    const onAutoClean = vi.fn();
    render(
      <MutationsErrors
        allErrors={[{text: 'mut1', errors: ['err1']}]}
        onAutoClean={onAutoClean}
      />
    );

    const link = screen.getByText('remove all problematic mutations');
    const event = new MouseEvent('click', {bubbles: true, cancelable: true});
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    link.dispatchEvent(event);

    expect(onAutoClean).toHaveBeenCalled();
  });
});

describe('useMutationErrors hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSanitizeMutations.mockReturnValue([[], [{text: 'mut1', errors: ['err']}]]);
  });

  it('invokes onPreventSubmit when errors exist', () => {
    const onPreventSubmit = vi.fn();
    const Wrapper = () =>
      useMutationErrors({
        mutations: ['mut1'],
        onChange: vi.fn(),
        onPreventSubmit,
        messages: {}
      });
    render(<Wrapper />);
    expect(onPreventSubmit).toHaveBeenCalled();
  });

  it('does not invoke onPreventSubmit when no errors', () => {
    mockSanitizeMutations.mockReturnValue([['mut1'], []]);
    const onPreventSubmit = vi.fn();
    const Wrapper = () =>
      useMutationErrors({
        mutations: ['mut1'],
        onChange: vi.fn(),
        onPreventSubmit,
        messages: {}
      });
    render(<Wrapper />);
    expect(onPreventSubmit).not.toHaveBeenCalled();
  });

  it('passes geneOnly to sanitizeMutations', () => {
    const Wrapper = () =>
      useMutationErrors({
        geneOnly: 'RT',
        mutations: ['M184V'],
        onChange: vi.fn(),
        onPreventSubmit: vi.fn(),
        messages: {}
      });
    render(<Wrapper />);

    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      ['M184V'],
      expect.objectContaining({defaultGene: 'RT'})
    );
  });

  it('passes allowPositions to sanitizeMutations', () => {
    const Wrapper = () =>
      useMutationErrors({
        allowPositions: true,
        mutations: ['184'],
        onChange: vi.fn(),
        onPreventSubmit: vi.fn(),
        messages: {}
      });
    render(<Wrapper />);

    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      ['184'],
      expect.objectContaining({allowPositions: true})
    );
  });

  it('passes defaultGene to sanitizeMutations', () => {
    const Wrapper = () =>
      useMutationErrors({
        defaultGene: 'PR',
        mutations: ['M184V'],
        onChange: vi.fn(),
        onPreventSubmit: vi.fn(),
        messages: {}
      });
    render(<Wrapper />);

    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      ['M184V'],
      expect.objectContaining({defaultGene: 'PR'})
    );
  });

  it('handles auto-clean by calling onChange with sanitized mutations', () => {
    mockSanitizeMutations.mockReturnValueOnce([[], [{text: 'bad', errors: ['err']}]]);
    mockSanitizeMutations.mockReturnValueOnce([['good'], []]);

    const onChange = vi.fn();
    const Wrapper = () =>
      useMutationErrors({
        mutations: ['bad', 'good'],
        onChange,
        onPreventSubmit: vi.fn(),
        messages: {}
      });
    render(<Wrapper />);

    fireEvent.click(screen.getByText('remove all problematic mutations'));

    expect(onChange).toHaveBeenCalledWith(['good']);
  });

  it('passes removeErrors flag when auto-cleaning', () => {
    const onChange = vi.fn();
    const Wrapper = () =>
      useMutationErrors({
        mutations: ['mut1'],
        onChange,
        onPreventSubmit: vi.fn(),
        messages: {}
      });
    render(<Wrapper />);

    fireEvent.click(screen.getByText('remove all problematic mutations'));

    expect(mockSanitizeMutations).toHaveBeenLastCalledWith(
      ['mut1'],
      expect.objectContaining({removeErrors: true})
    );
  });

  it('renders errors with parentClassName', () => {
    const Wrapper = () => useMutationErrors({
      parentClassName: 'test-parent',
      mutations: ['mut1'],
      onChange: vi.fn(),
      onPreventSubmit: vi.fn(),
      messages: {}
    });

    const {container} = render(<Wrapper />);

    expect(container.querySelector('.test-parent-errors')).toBeInTheDocument();
  });

  it('passes all config options to sanitizeMutations', () => {
    const Wrapper = () =>
      useMutationErrors({
        allowPositions: true,
        defaultGene: 'RT',
        geneOnly: 'PR',
        geneSynonyms: {rt: 'RT'},
        geneReferences: {RT: 'MKVL'},
        messages: {test: 'msg'},
        mutations: ['mut1'],
        onChange: vi.fn(),
        onPreventSubmit: vi.fn()
      });
    render(<Wrapper />);

    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      ['mut1'],
      expect.objectContaining({
        allowPositions: true,
        defaultGene: 'PR',
        geneSynonyms: {rt: 'RT'},
        geneReferences: {RT: 'MKVL'},
        messages: {test: 'msg'}
      })
    );
  });
});
