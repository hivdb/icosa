import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import DisableFlagSwitch from '../../../../../src/components/ngs2codfreq/options-form/flag-switch';

describe('DisableFlagSwitch', () => {
  it('renders label correctly', () => {
    const onChange = vi.fn();
    render(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={false}
        onChange={onChange}
        valueChoices={[false, true]}
        textChoices={['No', 'Yes']}
      />
    );

    expect(screen.getByText('Test Label:')).toBeInTheDocument();
  });

  it('renders all radio options', () => {
    const onChange = vi.fn();
    render(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={false}
        onChange={onChange}
        valueChoices={[false, true]}
        textChoices={['No', 'Yes']}
      />
    );

    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('checks the correct radio button based on value', () => {
    const onChange = vi.fn();
    render(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={true}
        onChange={onChange}
        valueChoices={[false, true]}
        textChoices={['No', 'Yes']}
      />
    );

    const yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    const noRadio = screen.getByLabelText('No') as HTMLInputElement;

    expect(yesRadio.checked).toBe(true);
    expect(noRadio.checked).toBe(false);
  });

  it('calls onChange with correct value when radio is clicked', () => {
    const onChange = vi.fn();
    render(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={false}
        onChange={onChange}
        valueChoices={[false, true]}
        textChoices={['No', 'Yes']}
      />
    );

    const yesRadio = screen.getByLabelText('Yes');
    fireEvent.click(yesRadio);

    expect(onChange).toHaveBeenCalledWith('testSwitch', true);
  });

  it('works with string values', () => {
    const onChange = vi.fn();
    render(
      <DisableFlagSwitch
        name="mode"
        label="Mode"
        value="auto"
        onChange={onChange}
        valueChoices={['auto', 'manual']}
        textChoices={['Automatic', 'Manual']}
      />
    );

    const manualRadio = screen.getByLabelText('Manual');
    fireEvent.click(manualRadio);

    expect(onChange).toHaveBeenCalledWith('mode', 'manual');
  });

  it('works with number values', () => {
    const onChange = vi.fn();
    render(
      <DisableFlagSwitch
        name="level"
        label="Level"
        value={1}
        onChange={onChange}
        valueChoices={[1, 2, 3]}
        textChoices={['Low', 'Medium', 'High']}
      />
    );

    const highRadio = screen.getByLabelText('High');
    fireEvent.click(highRadio);

    expect(onChange).toHaveBeenCalledWith('level', 3);
  });

  it('renders children when provided', () => {
    const onChange = vi.fn();
    render(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={false}
        onChange={onChange}
        valueChoices={[false, true]}
        textChoices={['No', 'Yes']}
      >
        <p>Help text here</p>
      </DisableFlagSwitch>
    );

    expect(screen.getByText('Help text here')).toBeInTheDocument();
  });

  it('does not render children container when no children provided', () => {
    const onChange = vi.fn();
    const {container} = render(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={false}
        onChange={onChange}
        valueChoices={[false, true]}
        textChoices={['No', 'Yes']}
      />
    );

    const descDiv = container.querySelector('[class*="fielddesc"]');
    expect(descDiv).not.toBeInTheDocument();
  });

  it('generates unique IDs for each radio button', () => {
    const onChange = vi.fn();
    render(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={false}
        onChange={onChange}
        valueChoices={[false, true, false]}
        textChoices={['Option 1', 'Option 2', 'Option 3']}
      />
    );

    expect(screen.getByLabelText('Option 1')).toHaveAttribute('id', 'testSwitch-0');
    expect(screen.getByLabelText('Option 2')).toHaveAttribute('id', 'testSwitch-1');
    expect(screen.getByLabelText('Option 3')).toHaveAttribute('id', 'testSwitch-2');
  });

  it('updates checked state when value prop changes', () => {
    const onChange = vi.fn();
    const {rerender} = render(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={false}
        onChange={onChange}
        valueChoices={[false, true]}
        textChoices={['No', 'Yes']}
      />
    );

    let yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    expect(yesRadio.checked).toBe(false);

    rerender(
      <DisableFlagSwitch
        name="testSwitch"
        label="Test Label"
        value={true}
        onChange={onChange}
        valueChoices={[false, true]}
        textChoices={['No', 'Yes']}
      />
    );

    yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    expect(yesRadio.checked).toBe(true);
  });
});
