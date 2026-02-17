import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import '@testing-library/jest-dom/vitest';

import {MutationPrefills, PrefillOption} from '../../../../src/components/mutations-input/mutation-prefills';
import useMutationPrefills from '../../../../src/components/mutations-input/mutation-prefills';

describe('MutationPrefills component', () => {
  it('calls onSelect with selected option', () => {
    const opts: PrefillOption[] = [
      {name: 'opt1', mutations: ['A']},
      {name: 'opt2', mutations: ['B']}
    ];
    const onSelect = vi.fn();
    render(
      <MutationPrefills labelMessage="Label" options={opts} onSelect={onSelect} />
    );
    fireEvent.change(screen.getByRole('listbox'), {
      target: {value: 'opt2'}
    });
    expect(onSelect).toHaveBeenCalledWith(opts[1]);
  });

  it('calls onSelect with null when no option selected', () => {
    const opts: PrefillOption[] = [
      {name: 'opt1', mutations: ['A']}
    ];
    const onSelect = vi.fn();
    render(
      <MutationPrefills labelMessage="Label" options={opts} onSelect={onSelect} />
    );
    
    // Simulate deselecting all options
    const select = screen.getByRole('listbox') as HTMLSelectElement;
    Object.defineProperty(select, 'selectedOptions', {
      value: [],
      writable: true
    });
    
    fireEvent.change(select);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('renders with value prop', () => {
    const opts: PrefillOption[] = [
      {name: 'opt1', mutations: ['A']},
      {name: 'opt2', mutations: ['B']}
    ];
    const onSelect = vi.fn();
    render(
      <MutationPrefills 
        labelMessage="Label" 
        options={opts} 
        value={opts[1]}
        onSelect={onSelect} 
      />
    );
    
    const select = screen.getByRole('listbox') as HTMLSelectElement;
    expect(select.value).toBe('opt2');
  });

  it('renders with null value', () => {
    const opts: PrefillOption[] = [
      {name: 'opt1', mutations: ['A']}
    ];
    const onSelect = vi.fn();
    render(
      <MutationPrefills 
        labelMessage="Label" 
        options={opts} 
        value={null}
        onSelect={onSelect} 
      />
    );
    
    const select = screen.getByRole('listbox') as HTMLSelectElement;
    expect(select.value).toBe('');
  });

  it('renders options with custom className', () => {
    const opts: PrefillOption[] = [
      {name: 'opt1', mutations: ['A'], className: 'custom-class'}
    ];
    const onSelect = vi.fn();
    render(
      <MutationPrefills labelMessage="Label" options={opts} onSelect={onSelect} />
    );
    
    const option = screen.getByRole('option', {name: 'opt1'});
    expect(option).toHaveClass('custom-class');
  });

  it('renders label message', () => {
    const opts: PrefillOption[] = [];
    const onSelect = vi.fn();
    render(
      <MutationPrefills labelMessage="Custom Label" options={opts} onSelect={onSelect} />
    );
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });
});

describe('useMutationPrefills hook', () => {
  it('renders null when no prefills configured', () => {
    const Stub = () => useMutationPrefills({onChange: vi.fn(), config: {messages: {}}});
    const {container} = render(<Stub />);
    expect(container.firstChild).toBeNull();
  });

  it('renders prefills when configured', () => {
    const onChange = vi.fn();
    const Stub = () => useMutationPrefills({
      onChange,
      config: {
        messages: {'pattern-analysis-prefill-label': 'Select Preset'},
        mutationPrefills: [
          {name: 'Preset1', mutations: ['M184V']},
          {name: 'Preset2', mutations: ['K65R']}
        ]
      }
    });
    render(<Stub />);
    
    expect(screen.getByText('Select Preset')).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'Preset1'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'Preset2'})).toBeInTheDocument();
  });

  it('includes clear option', () => {
    const onChange = vi.fn();
    const Stub = () => useMutationPrefills({
      onChange,
      config: {
        messages: {},
        mutationPrefills: [
          {name: 'Preset1', mutations: ['M184V']}
        ]
      }
    });
    render(<Stub />);
    
    expect(screen.getByRole('option', {name: '(clear)'})).toBeInTheDocument();
  });

  it('uses fallback label when message not provided', () => {
    const onChange = vi.fn();
    const Stub = () => useMutationPrefills({
      onChange,
      config: {
        messages: {},
        mutationPrefills: [
          {name: 'Preset1', mutations: ['M184V']}
        ]
      }
    });
    render(<Stub />);
    
    expect(screen.getByText('<pattern-analysis-prefill-label>')).toBeInTheDocument();
  });

  it('calls onChange when option selected', () => {
    const onChange = vi.fn();
    const Stub = () => useMutationPrefills({
      onChange,
      config: {
        messages: {},
        mutationPrefills: [
          {name: 'Preset1', mutations: ['M184V']}
        ]
      }
    });
    render(<Stub />);
    
    fireEvent.change(screen.getByRole('listbox'), {
      target: {value: 'Preset1'}
    });
    
    expect(onChange).toHaveBeenCalledWith(
      {name: 'Preset1', mutations: ['M184V']},
      false
    );
  });

  it('calls onChange with empty mutations when clear selected', () => {
    const onChange = vi.fn();
    const Stub = () => useMutationPrefills({
      onChange,
      config: {
        messages: {},
        mutationPrefills: [
          {name: 'Preset1', mutations: ['M184V']}
        ]
      }
    });
    render(<Stub />);
    
    // First select a preset
    fireEvent.change(screen.getByRole('listbox'), {
      target: {value: 'Preset1'}
    });
    
    // Then select clear
    fireEvent.change(screen.getByRole('listbox'), {
      target: {value: '(clear)'}
    });
    
    expect(onChange).toHaveBeenLastCalledWith(
      {name: null, mutations: []},
      false
    );
  });

  it('maintains selected value state', () => {
    const onChange = vi.fn();
    const Stub = () => useMutationPrefills({
      onChange,
      config: {
        messages: {},
        mutationPrefills: [
          {name: 'Preset1', mutations: ['M184V']},
          {name: 'Preset2', mutations: ['K65R']}
        ]
      }
    });
    render(<Stub />);
    
    const select = screen.getByRole('listbox') as HTMLSelectElement;
    
    // Select first preset
    fireEvent.change(select, {target: {value: 'Preset1'}});
    expect(select.value).toBe('Preset1');
    
    // Select second preset
    fireEvent.change(select, {target: {value: 'Preset2'}});
    expect(select.value).toBe('Preset2');
    
    // Clear selection
    fireEvent.change(select, {target: {value: '(clear)'}});
    expect(select.value).toBe('');
  });
});
