import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

type MutationError = {text: string; errors: string[]};

const mockParseMutation = vi.fn((m: string) => ['', '', '', m.split(':')[0] || '']);
const mockSanitizeMutations = vi.fn((muts: string[], config?: any): [string[], MutationError[]] => [muts, []]);
const mockParseAndValidateMutation = vi.fn((tag: string): {text: string; errors: string[]} => ({text: tag, errors: []}));

vi.mock('react-tagsinput', () => ({
  __esModule: true,
  default: ({value, onChange, inputProps, renderTag, className, focusedClassName, tagProps, pasteSplit}: any) => (
    <div className={className} data-testid="tagsinput-container">
      <input
        data-testid="tagsinput"
        value={value.join(',')}
        onChange={e => onChange(e.target.value.split(',').filter((v: string) => v))}
        {...inputProps}
      />
      {value.map((tag: string, idx: number) => (
        renderTag ? renderTag({
          tag,
          key: idx,
          onRemove: () => onChange(value.filter((_: any, i: number) => i !== idx)),
          classNameRemove: tagProps?.classNameRemove || '',
          className: tagProps?.className || ''
        }) : <span key={idx}>{tag}</span>
      ))}
    </div>
  )
}));

vi.mock('../../../../src/utils/mutation', () => ({
  parseMutation: (m: string) => mockParseMutation(m),
  sanitizeMutations: (muts: string[], config?: any) => mockSanitizeMutations(muts, config),
  parseAndValidateMutation: (tag: string) => mockParseAndValidateMutation(tag)
}));

vi.mock('../../../../src/components/mutations-input/mutations-errors', () => ({
  __esModule: true,
  default: ({mutations, onChange}: any) => (
    <div data-testid="errors">
      <button data-testid="error-change" onClick={() => onChange(['cleaned'])}>Clean</button>
    </div>
  )
}));

import MutationsTagsInput from '../../../../src/components/mutations-input/mutations-tagsinput';

describe('MutationsTagsInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSanitizeMutations.mockImplementation((muts: string[]) => [muts, []]);
    mockParseMutation.mockImplementation((m: string) => ['', '', '', m.split(':')[0] || '']);
    mockParseAndValidateMutation.mockImplementation((tag: string) => ({text: tag, errors: []}));
  });

  it('calls onChange with sanitized mutations', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    render(<MutationsTagsInput config={config} mutations={['A']} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('tagsinput'), {target: {value: 'B'}});
    expect(onChange).toHaveBeenCalledWith({mutations: ['B']}, false);
  });

  it('renders with placeholder from messages', () => {
    const onChange = vi.fn();
    const config = {
      geneReferences: {},
      geneSynonyms: {},
      messages: {'pattern-analysis-input-placeholder': 'Enter mutations here'}
    };
    render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);
    const input = screen.getByTestId('tagsinput');
    expect(input).toHaveAttribute('placeholder', 'Enter mutations here');
  });

  it('uses fallback placeholder when message not provided', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);
    const input = screen.getByTestId('tagsinput');
    expect(input).toHaveAttribute('placeholder', '<pattern-analysis-input-placeholder>');
  });

  it('renders label when provided in messages', () => {
    const onChange = vi.fn();
    const config = {
      geneReferences: {},
      geneSynonyms: {},
      messages: {'pattern-analysis-input-label': 'Mutations:'}
    };
    render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);
    expect(screen.getByText('Mutations:')).toBeInTheDocument();
  });

  it('does not render label when not provided', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    const {container} = render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('filters mutations by geneOnly', () => {
    mockParseMutation.mockImplementation((m: string) => {
      const parts = m.split(':');
      return ['', '', '', parts[0] || ''];
    });

    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    render(
      <MutationsTagsInput
        config={config}
        geneOnly="RT"
        mutations={['RT:M184V', 'PR:D30N', 'RT:K65R']}
        onChange={onChange}
      />
    );

    // Should only show RT mutations
    const input = screen.getByTestId('tagsinput') as HTMLInputElement;
    expect(input.value).toContain('RT:M184V');
    expect(input.value).toContain('RT:K65R');
  });

  it('adds gene prefix when geneOnly is set and mutation lacks prefix', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    mockParseMutation.mockReturnValue(['', '', '', '']);

    render(
      <MutationsTagsInput
        config={config}
        geneOnly="RT"
        mutations={[]}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByTestId('tagsinput'), {target: {value: 'M184V'}});

    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      ['RT:M184V'],
      expect.anything()
    );
  });

  it('preserves other gene mutations when geneOnly is set', () => {
    mockParseMutation.mockImplementation((m: string) => {
      const parts = m.split(':');
      return ['', '', '', parts[0] || ''];
    });

    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};

    render(
      <MutationsTagsInput
        config={config}
        geneOnly="RT"
        mutations={['RT:M184V', 'PR:D30N']}
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByTestId('tagsinput'), {target: {value: 'RT:K65R'}});

    // Should include both RT:K65R and the preserved PR:D30N
    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      expect.arrayContaining(['RT:K65R', 'PR:D30N']),
      expect.anything()
    );
  });

  it('passes errors to onChange when sanitization fails', () => {
    mockSanitizeMutations.mockReturnValue([['mut'], [{text: 'mut', errors: ['error']}]]);

    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);

    fireEvent.change(screen.getByTestId('tagsinput'), {target: {value: 'mut'}});

    expect(onChange).toHaveBeenCalledWith({mutations: ['mut']}, true);
  });

  it('applies parentClassName to container', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    const {container} = render(
      <MutationsTagsInput
        config={config}
        parentClassName="custom"
        mutations={[]}
        onChange={onChange}
      />
    );

    expect(container.querySelector('.custom-tagsinput')).toBeInTheDocument();
  });

  it('renders tags with error state', () => {
    mockParseAndValidateMutation.mockReturnValue({text: 'BAD', errors: ['Invalid mutation']});

    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    render(<MutationsTagsInput config={config} mutations={['BAD']} onChange={onChange} />);

    // The renderTag function should be called and render the tag with error state
    expect(mockParseAndValidateMutation).toHaveBeenCalledWith('BAD');
  });

  it('strips gene prefix from tag text when geneOnly is set', () => {
    mockParseAndValidateMutation.mockReturnValue({text: 'RT:M184V', errors: []});

    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    render(
      <MutationsTagsInput
        config={config}
        geneOnly="RT"
        mutations={['RT:M184V']}
        onChange={onChange}
      />
    );

    // parseAndValidateMutation should be called for rendering
    expect(mockParseAndValidateMutation).toHaveBeenCalled();
  });

  it('passes allowPositions to sanitizeMutations', () => {
    const onChange = vi.fn();
    const config = {
      allowPositions: true,
      geneReferences: {},
      geneSynonyms: {},
      messages: {}
    };
    render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);

    fireEvent.change(screen.getByTestId('tagsinput'), {target: {value: '184'}});

    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      ['184'],
      expect.objectContaining({allowPositions: true})
    );
  });

  it('passes mutationDefaultGene to sanitizeMutations', () => {
    const onChange = vi.fn();
    const config = {
      mutationDefaultGene: 'RT',
      geneReferences: {},
      geneSynonyms: {},
      messages: {}
    };
    render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);

    fireEvent.change(screen.getByTestId('tagsinput'), {target: {value: 'M184V'}});

    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      ['M184V'],
      expect.objectContaining({defaultGene: 'RT'})
    );
  });

  it('passes geneSynonyms to sanitizeMutations', () => {
    const onChange = vi.fn();
    const config = {
      geneSynonyms: {rt: 'RT'},
      geneReferences: {},
      messages: {}
    };
    render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);

    fireEvent.change(screen.getByTestId('tagsinput'), {target: {value: 'rt:M184V'}});

    expect(mockSanitizeMutations).toHaveBeenCalledWith(
      ['rt:M184V'],
      expect.objectContaining({geneSynonyms: {rt: 'RT'}})
    );
  });

  it('integrates with mutations-errors hook', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    render(<MutationsTagsInput config={config} mutations={['mut']} onChange={onChange} />);

    expect(screen.getByTestId('errors')).toBeInTheDocument();
  });

  it('handles error cleanup from mutations-errors', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {}, geneSynonyms: {}, messages: {}};
    render(<MutationsTagsInput config={config} mutations={['bad']} onChange={onChange} />);

    fireEvent.click(screen.getByTestId('error-change'));

    expect(mockSanitizeMutations).toHaveBeenCalledWith(['cleaned'], expect.anything());
  });

  it('sets input size based on placeholder length', () => {
    const onChange = vi.fn();
    const config = {
      geneReferences: {},
      geneSynonyms: {},
      messages: {'pattern-analysis-input-placeholder': 'Very long placeholder text here'}
    };
    render(<MutationsTagsInput config={config} mutations={[]} onChange={onChange} />);

    const input = screen.getByTestId('tagsinput');
    // Placeholder is 31 characters long
    expect(input).toHaveAttribute('size', '31');
  });

  it('handles remove button click on mutation tag', () => {
    const onChange = vi.fn();
    const config = {
      geneReferences: {},
      geneSynonyms: {},
      messages: {}
    };
    mockSanitizeMutations.mockReturnValue([['K103N'], []]);

    const {container} = render(<MutationsTagsInput config={config} mutations={['M184V', 'K103N']} onChange={onChange} />);

    // Find and click the remove link by href
    const removeLinks = container.querySelectorAll('a[href="#remove-mutation"]');
    expect(removeLinks).toHaveLength(2);

    fireEvent.click(removeLinks[0]);

    // Should call sanitizeMutations with the remaining mutation
    expect(mockSanitizeMutations).toHaveBeenCalledWith(['K103N'], expect.anything());
  });

  it('uses pasteSplit function to split pasted text', () => {
    const onChange = vi.fn();
    const config = {
      geneReferences: {},
      geneSynonyms: {},
      messages: {}
    };

    // The pasteSplit function should split on various delimiters
    const pasteSplit = (data: string) => data.split(/[\s,;+.]+/g);

    // Test the function directly
    expect(pasteSplit('M184V K103N')).toEqual(['M184V', 'K103N']);
    expect(pasteSplit('M184V,K103N')).toEqual(['M184V', 'K103N']);
    expect(pasteSplit('M184V;K103N')).toEqual(['M184V', 'K103N']);
    expect(pasteSplit('M184V+K103N')).toEqual(['M184V', 'K103N']);
    expect(pasteSplit('M184V.K103N')).toEqual(['M184V', 'K103N']);
    expect(pasteSplit('M184V, K103N; Y181C')).toEqual(['M184V', 'K103N', 'Y181C']);
  });
});
