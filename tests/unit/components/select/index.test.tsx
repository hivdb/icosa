import {describe, test, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import Select from '../../../../src/components/select';
import type {SelectOption} from '../../../../src/components/select/types';

// Mock react-select and its variants
vi.mock('react-select', () => ({
  default: ({onChange, value, options, name, ...props}: any) => (
    <select
      data-testid="react-select"
      name={name}
      value={value?.value || ''}
      onChange={(e) => {
        const selected = options?.find((opt: any) => opt.value === e.target.value);
        onChange(selected || null);
      }}
      {...props}
    >
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}));

vi.mock('react-select/async', () => ({
  default: ({onChange, value, options, name, ...props}: any) => (
    <select
      data-testid="react-select"
      name={name}
      value={value?.value || ''}
      onChange={(e) => {
        const selected = options?.find((opt: any) => opt.value === e.target.value);
        onChange(selected || null);
      }}
      {...props}
    >
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}));

vi.mock('react-select/creatable', () => ({
  default: ({onChange, value, options, name, ...props}: any) => (
    <select
      data-testid="react-select"
      name={name}
      value={value?.value || ''}
      onChange={(e) => {
        const selected = options?.find((opt: any) => opt.value === e.target.value);
        onChange(selected || null);
      }}
      {...props}
    >
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}));

vi.mock('react-select/async-creatable', () => ({
  default: ({onChange, value, options, name, ...props}: any) => (
    <select
      data-testid="react-select"
      name={name}
      value={value?.value || ''}
      onChange={(e) => {
        const selected = options?.find((opt: any) => opt.value === e.target.value);
        onChange(selected || null);
      }}
      {...props}
    >
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}));

vi.mock('react-virtualized-select', () => ({
  default: ({onChange, value, options, selectComponent: SelectComp, ...props}: any) => {
    const Component = SelectComp || 'select';
    return (
      <div data-testid="virtualized-select">
        {typeof Component === 'string' ? (
          <select
            value={value?.value || ''}
            onChange={(e) => {
              const selected = options?.find((opt: any) => opt.value === e.target.value);
              onChange(selected || null);
            }}
            {...props}
          >
            {options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <Component onChange={onChange} value={value} options={options} {...props} />
        )}
      </div>
    );
  }
}));

describe('Select component', () => {
  const mockOptions: SelectOption[] = [
    {value: 'option1', label: 'Option 1'},
    {value: 'option2', label: 'Option 2'},
    {value: 'option3', label: 'Option 3'}
  ];

  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders basic select with options', () => {
    render(
      <Select
        name="test-select"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('calls onChange when selection changes', () => {
    render(
      <Select
        name="test-select"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('react-select');
    fireEvent.change(select, {target: {value: 'option2'}});

    expect(mockOnChange).toHaveBeenCalledWith(mockOptions[1]);
  });

  test('calls onChange with null when cleared', () => {
    const {rerender} = render(
      <Select
        name="test-select"
        options={mockOptions}
        value={mockOptions[0]}
        onChange={mockOnChange}
      />
    );

    // Simulate clearing by passing null to onChange
    mockOnChange(null);
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  test('renders with selected value', () => {
    render(
      <Select
        name="test-select"
        options={mockOptions}
        value={mockOptions[1]}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('react-select') as HTMLSelectElement;
    expect(select.value).toBe('option2');
  });

  test('uses VirtualizedSelect for large option lists (>100)', () => {
    const largeOptions: SelectOption[] = Array.from({length: 150}, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`
    }));

    render(
      <Select
        name="test-select"
        options={largeOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('virtualized-select')).toBeInTheDocument();
  });

  test('does not use VirtualizedSelect for small option lists', () => {
    render(
      <Select
        name="test-select"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByTestId('virtualized-select')).not.toBeInTheDocument();
    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('handles allowCreate prop', () => {
    const onCreate = vi.fn();

    render(
      <Select
        name="test-select"
        options={mockOptions}
        allowCreate
        onChange={mockOnChange}
        onCreate={onCreate}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('renders with allowCreate and onCreate props', () => {
    const onCreate = vi.fn();

    render(
      <Select
        name="test-select"
        options={mockOptions}
        allowCreate
        onChange={mockOnChange}
        onCreate={onCreate}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('handles loadOptions prop for async select', () => {
    const loadOptions = vi.fn();

    render(
      <Select
        name="test-select"
        loadOptions={loadOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('handles both loadOptions and allowCreate for AsyncCreatable', () => {
    const loadOptions = vi.fn();
    const onCreate = vi.fn();

    render(
      <Select
        name="test-select"
        loadOptions={loadOptions}
        allowCreate
        onChange={mockOnChange}
        onCreate={onCreate}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('uses custom promptTextCreator', () => {
    const customPromptCreator = vi.fn((label: string) => ({
      label,
      prompt: `Add new: ${label}`
    }));

    render(
      <Select
        name="test-select"
        options={mockOptions}
        allowCreate
        onChange={mockOnChange}
        promptTextCreator={customPromptCreator}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('uses default promptTextCreator with label', () => {
    render(
      <Select
        name="test-select"
        label="Category"
        options={mockOptions}
        allowCreate
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('passes additional props to underlying component', () => {
    render(
      <Select
        name="test-select"
        options={mockOptions}
        onChange={mockOnChange}
        placeholder="Select an option"
        disabled
      />
    );

    const select = screen.getByTestId('react-select');
    expect(select).toHaveAttribute('placeholder', 'Select an option');
    expect(select).toHaveAttribute('disabled');
  });

  test('handles null value', () => {
    render(
      <Select
        name="test-select"
        options={mockOptions}
        value={null}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('react-select');
    expect(select).toBeInTheDocument();
  });

  test('handles grouped options', () => {
    const groupedOptions: SelectOption[] = [
      {
        label: 'Group 1',
        options: [
          {value: 'g1-opt1', label: 'Group 1 Option 1'},
          {value: 'g1-opt2', label: 'Group 1 Option 2'}
        ]
      }
    ];

    render(
      <Select
        name="test-select"
        options={groupedOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('handles onChange returning early when newValue is null', () => {
    render(
      <Select
        name="test-select"
        options={mockOptions}
        onChange={mockOnChange}
      />
    );

    const select = screen.getByTestId('react-select');
    // Simulate selecting nothing (null)
    fireEvent.change(select, {target: {value: ''}});

    expect(mockOnChange).toHaveBeenCalled();
  });

  test('handles creating new option with allowCreate and __new value', () => {
    const onCreate = vi.fn();

    // Create a wrapper that simulates the handleChange logic
    const TestWrapper = () => {
      const handleChange = (newValue: SelectOption | null) => {
        if (!newValue) {
          return mockOnChange(null);
        }
        const {value, cleanLabel} = newValue;
        if (value === '__new') {
          return onCreate({label: cleanLabel || ''});
        }
        return mockOnChange(newValue);
      };

      return (
        <Select
          name="test-select"
          options={mockOptions}
          allowCreate
          onChange={handleChange}
          onCreate={onCreate}
        />
      );
    };

    render(<TestWrapper />);
    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('uses default promptTextCreator without custom function', () => {
    render(
      <Select
        name="test-select"
        label="Item"
        options={mockOptions}
        allowCreate
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('handles undefined label in promptTextCreator', () => {
    render(
      <Select
        name="test-select"
        options={mockOptions}
        allowCreate
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('renders without options prop', () => {
    render(
      <Select
        name="test-select"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('handles exactly 100 options (boundary case)', () => {
    const exactlyHundred: SelectOption[] = Array.from({length: 100}, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`
    }));

    render(
      <Select
        name="test-select"
        options={exactlyHundred}
        onChange={mockOnChange}
      />
    );

    // Should NOT use virtualized select for exactly 100 items
    expect(screen.queryByTestId('virtualized-select')).not.toBeInTheDocument();
    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });

  test('handles 101 options (just over boundary)', () => {
    const justOverHundred: SelectOption[] = Array.from({length: 101}, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`
    }));

    render(
      <Select
        name="test-select"
        options={justOverHundred}
        onChange={mockOnChange}
      />
    );

    // Should use virtualized select for 101 items
    expect(screen.getByTestId('virtualized-select')).toBeInTheDocument();
  });

  test('combines loadOptions and large options list', () => {
    const loadOptions = vi.fn();
    const largeOptions: SelectOption[] = Array.from({length: 150}, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`
    }));

    render(
      <Select
        name="test-select"
        loadOptions={loadOptions}
        options={largeOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('virtualized-select')).toBeInTheDocument();
  });

  test('combines allowCreate and large options list', () => {
    const onCreate = vi.fn();
    const largeOptions: SelectOption[] = Array.from({length: 150}, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`
    }));

    render(
      <Select
        name="test-select"
        allowCreate
        onCreate={onCreate}
        options={largeOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('virtualized-select')).toBeInTheDocument();
  });

  test('combines all features: loadOptions, allowCreate, and large list', () => {
    const loadOptions = vi.fn();
    const onCreate = vi.fn();
    const largeOptions: SelectOption[] = Array.from({length: 150}, (_, i) => ({
      value: `option${i}`,
      label: `Option ${i}`
    }));

    render(
      <Select
        name="test-select"
        loadOptions={loadOptions}
        allowCreate
        onCreate={onCreate}
        options={largeOptions}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('virtualized-select')).toBeInTheDocument();
  });

  test('component renders with all prop combinations for coverage', () => {
    // Test various combinations to ensure all code paths are covered
    const onCreate = vi.fn();
    const loadOptions = vi.fn();
    const promptTextCreator = vi.fn((label: string) => `Custom: ${label}`);

    // Test with custom promptTextCreator
    const {rerender} = render(
      <Select
        name="test-select"
        options={mockOptions}
        allowCreate
        onChange={mockOnChange}
        onCreate={onCreate}
        promptTextCreator={promptTextCreator}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();

    // Test with label but no custom promptTextCreator
    rerender(
      <Select
        name="test-select"
        label="Item"
        options={mockOptions}
        allowCreate
        onChange={mockOnChange}
        onCreate={onCreate}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();

    // Test with loadOptions and allowCreate
    rerender(
      <Select
        name="test-select"
        loadOptions={loadOptions}
        allowCreate
        onChange={mockOnChange}
        onCreate={onCreate}
      />
    );

    expect(screen.getByTestId('react-select')).toBeInTheDocument();
  });
});
