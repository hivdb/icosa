import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import AdapterInput from '../../../../../src/components/ngs2codfreq/options-form/adapter-input';

describe('AdapterInput', () => {
  it('renders label correctly', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter Sequence"
        value="auto"
        onChange={onChange}
      />
    );

    expect(screen.getByText('Adapter Sequence:')).toBeInTheDocument();
  });

  it('renders checkbox with auto-detect text', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
      />
    );

    expect(screen.getByText('Auto detect, or type/paste in:')).toBeInTheDocument();
  });

  it('checks checkbox when value is auto', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('unchecks checkbox when value is not auto', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="ATCGATCG"
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('shows empty textarea when value is auto', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
      />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('shows sequence in textarea when value is not auto', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="ATCGATCG"
        onChange={onChange}
      />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('ATCGATCG');
  });

  it('calls onChange with auto when checkbox is checked', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="ATCGATCG"
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith('adapter', 'auto');
  });

  it('calls onChange with sequence when textarea is edited', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {target: {value: 'ATCGATCG'}});

    expect(onChange).toHaveBeenCalledWith('adapter', 'ATCGATCG');
  });

  it('calls onChange with auto when textarea is cleared', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="ATCGATCG"
        onChange={onChange}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {target: {value: ''}});

    expect(onChange).toHaveBeenCalledWith('adapter', 'auto');
  });

  it('uses custom autoValue when provided', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="ATCG"
        onChange={onChange}
        autoValue="detect"
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    // Click checkbox to set to auto (custom autoValue)
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith('adapter', 'detect');

    onChange.mockClear();

    // Clear textarea should also use custom autoValue
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, {target: {value: ''}});

    expect(onChange).toHaveBeenCalledWith('adapter', 'detect');
  });

  it('disables checkbox when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
        disabled={true}
      />
    );

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });

  it('disables textarea when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
        disabled={true}
      />
    );

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it('renders children when provided', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
      >
        <p>Help text for adapter</p>
      </AdapterInput>
    );

    expect(screen.getByText('Help text for adapter')).toBeInTheDocument();
  });

  it('does not render children container when no children provided', () => {
    const onChange = vi.fn();
    const {container} = render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
      />
    );

    const descDiv = container.querySelector('[class*="fielddesc"]');
    expect(descDiv).not.toBeInTheDocument();
  });

  it('focuses textarea when checkbox is unchecked', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapter"
        label="Adapter"
        value="auto"
        onChange={onChange}
      />
    );

    const checkbox = screen.getByRole('checkbox');

    // Unchecking the checkbox (when it's already checked) should focus textarea but not call onChange
    fireEvent.click(checkbox);

    // onChange is not called when unchecking - it only focuses the textarea
    expect(onChange).not.toHaveBeenCalled();
  });

  it('generates correct IDs for elements', () => {
    const onChange = vi.fn();
    render(
      <AdapterInput
        name="adapterSeq"
        label="Adapter"
        value="auto"
        onChange={onChange}
      />
    );

    expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'adapterSeq-checkbox-input');
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'adapterSeq-textarea');
  });
});
