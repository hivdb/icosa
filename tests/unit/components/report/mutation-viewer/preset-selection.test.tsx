import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock react-dropdown to simplify interaction
vi.mock('react-dropdown', () => ({
  default: ({ options, value, onChange }: any) => (
    <select
      data-testid="dropdown"
      value={value}
      onChange={e => onChange({ value: e.target.value })}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}));

import PresetSelection from '../../../../../src/components/report/mutation-viewer/preset-selection';

describe('PresetSelection', () => {
  it('calls onChange when a new option is selected', () => {
    const onChange = vi.fn();
    render(
      <PresetSelection
        options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]}
        value="a"
        onChange={onChange}
      />
    );
    const dropdown = screen.getByTestId('dropdown');
    fireEvent.change(dropdown, { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
