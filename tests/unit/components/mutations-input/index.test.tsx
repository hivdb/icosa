import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('../../../../src/components/mutations-input/mutations-tagsinput', () => ({
  __esModule: true,
  default: ({onChange, geneOnly}: any) => (
    <button
      data-testid={geneOnly ? `tagsinput-${geneOnly}` : 'tagsinput'}
      onClick={() => onChange({mutations: ['C']}, false)}
    >
      {geneOnly || 'all'}
    </button>
  )
}));

vi.mock('../../../../src/components/mutations-input/mutation-prefills', () => ({
  __esModule: true,
  default: () => <div data-testid="prefills">Prefills</div>
}));

let mockSuggestOnChange: any = null;
vi.mock('../../../../src/components/mutations-input/mutation-suggest-options', () => ({
  __esModule: true,
  default: ({onChange, gene, children}: any) => {
    mockSuggestOnChange = onChange;
    return (
      <div data-testid={`suggest-${gene}`}>
        <button onClick={() => onChange({value: 'mut', label: 'L'})}>Select</button>
        <button onClick={() => onChange({value: 'RT:M184', label: '*'})}>Wildcard</button>
        <button onClick={() => onChange({value: '', label: 'Empty'})}>Empty</button>
        {children}
      </div>
    );
  }
}));

type MutationError = {text: string; errors: string[]};
const mockSanitizeMutations = vi.fn((muts: string[], config?: any): [string[], MutationError[]] => [muts, []]);

vi.mock('../../../../src/utils/mutation', () => ({
  sanitizeMutations: (muts: string[], config?: any) => mockSanitizeMutations(muts, config)
}));

import MutationsInput, { MutationsConfig } from '../../../../src/components/mutations-input';

describe('MutationsInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSanitizeMutations.mockReturnValue([[], []]);
  });

  it('renders without mutation suggestions', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      geneReferences: {},
      geneDisplay: {},
      geneSynonyms: {},
      messages: {}
    };
    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    expect(screen.getByTestId('prefills')).toBeInTheDocument();
    expect(screen.getByTestId('tagsinput')).toBeInTheDocument();
  });

  it('renders with mutation suggestions', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [{
        gene: 'RT',
        mutations: [[184, ['V'] as Iterable<string>]]
      }],
      geneReferences: { RT: 'M' },
      geneDisplay: { RT: 'RT' },
      geneSynonyms: {},
      messages: {}
    };
    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    expect(screen.getByTestId('suggest-RT')).toBeInTheDocument();
  });

  it('handles suggestion selection with normal label', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [{
        gene: 'RT',
        mutations: [[184, ['V'] as Iterable<string>]]
      }],
      geneReferences: { RT: 'M' },
      geneDisplay: { RT: 'RT' },
      geneSynonyms: {},
      messages: {}
    };
    mockSanitizeMutations.mockReturnValue([['mut'], []]);
    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Select'));
    expect(onChange).toHaveBeenCalledWith({mutations: ['mut']}, false);
  });

  it('handles suggestion selection and renders mutation suggestions', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [{
        gene: 'RT',
        mutations: [[184, ['V'] as Iterable<string>]]
      }],
      geneReferences: { RT: 'M' },
      geneDisplay: { RT: 'RT' },
      geneSynonyms: {},
      messages: {}
    };

    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);

    // Verify component renders with suggestions
    expect(screen.getByTestId('suggest-RT')).toBeInTheDocument();
  });

  it('renders without suggestions when mutationSuggestions is empty', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [],
      geneReferences: {},
      geneDisplay: {},
      geneSynonyms: {},
      messages: {}
    };

    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);

    // Should render main input but no suggestion sections
    expect(screen.getByTestId('tagsinput')).toBeInTheDocument();
    expect(screen.queryByTestId('suggest-RT')).not.toBeInTheDocument();
  });

  it('passes errors to onChange when sanitization fails', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [{
        gene: 'RT',
        mutations: [[184, ['V'] as Iterable<string>]]
      }],
      geneReferences: { RT: 'M' },
      geneDisplay: { RT: 'RT' },
      geneSynonyms: {},
      messages: {}
    };

    const errors = [{text: 'mut', errors: ['error']}];
    mockSanitizeMutations.mockReturnValue([['mut'], errors]);

    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Select'));

    expect(onChange).toHaveBeenCalledWith({mutations: ['mut']}, true);
  });

  it('renders with splitGeneInput enabled', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSplitGeneInput: true,
      mutationSuggestions: [{
        gene: 'RT',
        mutations: [[184, ['V'] as Iterable<string>]]
      }],
      geneReferences: { RT: 'M' },
      geneDisplay: { RT: 'RT' },
      geneSynonyms: {},
      messages: {}
    };

    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);

    // Should not render main input when splitGeneInput is true
    expect(screen.queryByTestId('tagsinput')).not.toBeInTheDocument();
    // Should render gene-specific input
    expect(screen.getByTestId('tagsinput-RT')).toBeInTheDocument();
  });

  it('passes extra props through onChange', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      geneReferences: {},
      geneDisplay: {},
      geneSynonyms: {},
      messages: {}
    };

    render(
      <MutationsInput
        config={config}
        mutations={[]}
        onChange={onChange}
        extraProp="extraValue"
      />
    );

    fireEvent.click(screen.getByTestId('tagsinput'));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({extraProp: 'extraValue', mutations: ['C']}),
      false
    );
  });

  it('applies custom className', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      geneReferences: {},
      geneDisplay: {},
      geneSynonyms: {},
      messages: {}
    };

    const {container} = render(
      <MutationsInput
        config={config}
        mutations={[]}
        onChange={onChange}
        className="custom-class"
      />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('handles multiple mutation suggestions', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [
        {
          gene: 'RT',
          mutations: [[184, ['V'] as Iterable<string>]]
        },
        {
          gene: 'PR',
          mutations: [[30, ['N'] as Iterable<string>]]
        }
      ],
      geneReferences: { RT: 'M', PR: 'D' },
      geneDisplay: { RT: 'RT', PR: 'PR' },
      geneSynonyms: {},
      messages: {}
    };

    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);

    expect(screen.getByTestId('suggest-RT')).toBeInTheDocument();
    expect(screen.getByTestId('suggest-PR')).toBeInTheDocument();
  });

  it('updates stableExtras when extras change', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      geneReferences: {},
      geneDisplay: {},
      geneSynonyms: {},
      messages: {}
    };

    const {rerender} = render(
      <MutationsInput
        config={config}
        mutations={[]}
        onChange={onChange}
        extraProp="value1"
      />
    );

    fireEvent.click(screen.getByTestId('tagsinput'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({extraProp: 'value1'}),
      false
    );

    onChange.mockClear();

    // Change extras to trigger isEqual check
    rerender(
      <MutationsInput
        config={config}
        mutations={[]}
        onChange={onChange}
        extraProp="value2"
      />
    );

    fireEvent.click(screen.getByTestId('tagsinput'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({extraProp: 'value2'}),
      false
    );
  });

  it('handles prompt cancellation when selecting wildcard mutation', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [{
        gene: 'RT',
        mutations: [[184, ['V'] as Iterable<string>]]
      }],
      geneReferences: { RT: 'M' },
      geneDisplay: { RT: 'RT' },
      geneSynonyms: {},
      messages: {}
    };

    // Mock prompt to return null (user cancels)
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);

    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Wildcard'));

    // Prompt should be called
    expect(promptSpy).toHaveBeenCalled();
    // onChange should NOT be called because user cancelled
    expect(onChange).not.toHaveBeenCalled();

    promptSpy.mockRestore();
  });

  it('handles prompt acceptance when selecting wildcard mutation', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [{
        gene: 'RT',
        mutations: [[184, ['V'] as Iterable<string>]]
      }],
      geneReferences: { RT: 'M' },
      geneDisplay: { RT: 'RT' },
      geneSynonyms: {},
      messages: {}
    };

    // Mock prompt to return amino acids
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('V');
    mockSanitizeMutations.mockReturnValue([['RT:M184V'], []]);

    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Wildcard'));

    // Prompt should be called
    expect(promptSpy).toHaveBeenCalled();
    // onChange should be called with the completed mutation
    expect(onChange).toHaveBeenCalledWith({mutations: ['RT:M184V']}, false);

    promptSpy.mockRestore();
  });

  it('handles empty mutation value', () => {
    const onChange = vi.fn();
    const config: MutationsConfig = {
      mutationSuggestions: [{
        gene: 'RT',
        mutations: [[184, ['V'] as Iterable<string>]]
      }],
      geneReferences: { RT: 'M' },
      geneDisplay: { RT: 'RT' },
      geneSynonyms: {},
      messages: {}
    };

    render(<MutationsInput config={config} mutations={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText('Empty'));

    // onChange should NOT be called for empty value
    expect(onChange).not.toHaveBeenCalled();
  });
});
