import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

vi.mock('../../../../src/components/select', () => ({
  __esModule: true,
  default: ({options, onChange, value, name, placeholder}: any) => (
    <select 
      data-testid="select" 
      name={name}
      onChange={e => {
        const selectedOption = options.find((o: any) => o.value === e.target.value);
        if (selectedOption) {
          onChange(selectedOption);
        }
      }} 
      value={value?.value || ''}
    >
      <option value="">{placeholder}</option>
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}));

const mockExpandIndel = vi.fn((aa: string) => aa);

vi.mock('../../../../src/utils/mutation', () => ({
  expandIndel: (aa: string) => mockExpandIndel(aa)
}));

import MutationSuggestOptions from '../../../../src/components/mutations-input/mutation-suggest-options';

describe('MutationSuggestOptions', () => {
  it('invokes onChange when an option selected', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {gene: 'A'}, geneDisplay: {gene: 'Gene'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[[1, ['T']]]}
        config={config}
        onChange={onChange}
      />
    );
    fireEvent.change(screen.getByTestId('select'), {target: {value: 'gene:A1T'}});
    expect(onChange).toHaveBeenCalledWith({value: 'gene:A1T', label: 'T'});
  });

  it('renders gene display name in heading', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {RT: 'M'}, geneDisplay: {RT: 'Reverse Transcriptase'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="RT"
        mutations={[[184, ['V']]]}
        config={config}
        onChange={onChange}
      />
    );
    expect(screen.getByText(/Enter Reverse Transcriptase mutations:/)).toBeInTheDocument();
  });

  it('uses gene name when display name not available', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {gene: 'A'}, geneDisplay: {}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[[1, ['T']]]}
        config={config}
        onChange={onChange}
      />
    );
    expect(screen.getByText(/Enter gene mutations:/)).toBeInTheDocument();
  });

  it('shows positions text when allowPositions is true', () => {
    const onChange = vi.fn();
    const config = {
      allowPositions: true,
      geneReferences: {gene: 'A'},
      geneDisplay: {gene: 'Gene'},
      messages: {}
    };
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[[1, ['T']]]}
        config={config}
        onChange={onChange}
      />
    );
    expect(screen.getByText(/Enter Gene mutations or positions:/)).toBeInTheDocument();
  });

  it('uses custom message when provided', () => {
    const onChange = vi.fn();
    const config = {
      geneReferences: {RT: 'M'},
      geneDisplay: {RT: 'RT'},
      messages: {
        'pattern-analysis-suggest-options-label-RT': 'Custom RT Label'
      }
    };
    render(
      <MutationSuggestOptions
        gene="RT"
        mutations={[[184, ['V']]]}
        config={config}
        onChange={onChange}
      />
    );
    expect(screen.getByText('Custom RT Label')).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {gene: 'A'}, geneDisplay: {gene: 'Gene'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[[1, ['T']]]}
        config={config}
        onChange={onChange}
      >
        <div data-testid="child-content">Child Content</div>
      </MutationSuggestOptions>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders multiple mutations for same position', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {gene: 'ABCD'}, geneDisplay: {gene: 'Gene'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[[1, ['T', 'V', 'I']]]}
        config={config}
        onChange={onChange}
      />
    );
    
    const select = screen.getByTestId('select');
    const options = select.querySelectorAll('option');
    
    // Should have placeholder + T, V, I, and * options
    expect(options.length).toBeGreaterThanOrEqual(5);
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.getByText('V')).toBeInTheDocument();
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders multiple positions', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {gene: 'ABCD'}, geneDisplay: {gene: 'Gene'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[
          [1, ['T']],
          [2, ['V']],
          [3, ['I']]
        ]}
        config={config}
        onChange={onChange}
      />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls expandIndel for each amino acid', () => {
    mockExpandIndel.mockClear();
    mockExpandIndel.mockImplementation((aa: string) => aa);
    
    const onChange = vi.fn();
    const config = {geneReferences: {gene: 'AB'}, geneDisplay: {gene: 'Gene'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[[1, ['T', 'V']]]}
        config={config}
        onChange={onChange}
      />
    );
    
    // expandIndel should be called for each amino acid option
    expect(mockExpandIndel).toHaveBeenCalledWith('T');
    expect(mockExpandIndel).toHaveBeenCalledWith('V');
  });

  it('includes asterisk option for custom amino acids', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {gene: 'ABC'}, geneDisplay: {gene: 'Gene'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="gene"
        mutations={[[2, ['T']]]}
        config={config}
        onChange={onChange}
      />
    );
    
    // Asterisk option should have value with position only
    const select = screen.getByTestId('select');
    const asteriskOption = Array.from(select.querySelectorAll('option')).find(
      opt => opt.textContent === '*'
    );
    expect(asteriskOption).toBeDefined();
    expect(asteriskOption?.getAttribute('value')).toBe('gene:B2');
  });

  it('constructs correct mutation value with gene prefix', () => {
    const onChange = vi.fn();
    const config = {geneReferences: {RT: 'MKVL'}, geneDisplay: {RT: 'RT'}, messages: {}};
    render(
      <MutationSuggestOptions
        gene="RT"
        mutations={[[3, ['I']]]}
        config={config}
        onChange={onChange}
      />
    );
    
    fireEvent.change(screen.getByTestId('select'), {target: {value: 'RT:V3I'}});
    expect(onChange).toHaveBeenCalledWith({value: 'RT:V3I', label: 'I'});
  });
});
