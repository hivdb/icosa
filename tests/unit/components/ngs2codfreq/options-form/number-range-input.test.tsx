import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import NumberRangeInput from '../../../../../src/components/ngs2codfreq/options-form/number-range-input';

describe('NumberRangeInput', () => {
  it('renders label correctly', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality Score"
        value={15}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Quality Score:')).toBeInTheDocument();
  });

  it('renders range and number inputs', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    const inputs = screen.getAllByDisplayValue('15');
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveAttribute('type', 'range');
    expect(inputs[1]).toHaveAttribute('type', 'number');
  });

  it('calls onChange when range input changes', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    const rangeInput = screen.getAllByDisplayValue('15')[0];
    fireEvent.change(rangeInput, {target: {value: '20'}});

    expect(onChange).toHaveBeenCalledWith('quality', 20);
  });

  it('calls onChange when number input changes', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    const numberInput = screen.getAllByDisplayValue('15')[1];
    fireEvent.change(numberInput, {target: {value: '25'}});

    expect(onChange).toHaveBeenCalledWith('quality', 25);
  });

  it('selects all text when number input is clicked', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    const numberInput = screen.getAllByDisplayValue('15')[1] as HTMLInputElement;
    const selectSpy = vi.spyOn(numberInput, 'select');

    fireEvent.click(numberInput);

    expect(selectSpy).toHaveBeenCalled();
  });

  it('applies min, max, and step attributes', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
        min={10}
        max={50}
        step={5}
      />
    );

    const rangeInput = screen.getAllByDisplayValue('15')[0];
    const numberInput = screen.getAllByDisplayValue('15')[1];

    expect(rangeInput).toHaveAttribute('min', '10');
    expect(rangeInput).toHaveAttribute('max', '50');
    expect(rangeInput).toHaveAttribute('step', '5');

    expect(numberInput).toHaveAttribute('min', '10');
    expect(numberInput).toHaveAttribute('max', '50');
    expect(numberInput).toHaveAttribute('step', '5');
  });

  it('uses default min, max, step when not provided', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    const rangeInput = screen.getAllByDisplayValue('15')[0];

    expect(rangeInput).toHaveAttribute('min', '0');
    expect(rangeInput).toHaveAttribute('max', '100');
    expect(rangeInput).toHaveAttribute('step', '1');
  });

  it('shows reset link when value differs from default', () => {
    const onChange = vi.fn();
    const {container} = render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={20}
        defaultValue={15}
        onChange={onChange}
      />
    );

    expect(screen.getByText('reset to default')).toBeInTheDocument();
    // The text ": 15" is split across elements, so check the container text content
    expect(container.textContent).toContain(': 15');
  });

  it('does not show reset link when value equals default', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        defaultValue={15}
        onChange={onChange}
      />
    );

    expect(screen.queryByText('reset to default')).not.toBeInTheDocument();
  });

  it('does not show reset link when no default provided', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    expect(screen.queryByText('reset to default')).not.toBeInTheDocument();
  });

  it('resets to default value when reset link is clicked', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={20}
        defaultValue={15}
        onChange={onChange}
      />
    );

    const resetLink = screen.getByText('reset to default');
    fireEvent.click(resetLink);

    expect(onChange).toHaveBeenCalledWith('quality', 15);
  });

  it('prevents default action when reset link is clicked', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={20}
        defaultValue={15}
        onChange={onChange}
      />
    );

    const resetLink = screen.getByText('reset to default');
    const event = new MouseEvent('click', {bubbles: true, cancelable: true});
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    resetLink.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('disables inputs when disabled prop is true', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
        disabled={true}
      />
    );

    const rangeInput = screen.getAllByDisplayValue('15')[0] as HTMLInputElement;
    const numberInput = screen.getAllByDisplayValue('15')[1] as HTMLInputElement;

    expect(rangeInput.disabled).toBe(true);
    expect(numberInput.disabled).toBe(true);
  });

  it('renders children when provided', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      >
        <p>Help text for quality</p>
      </NumberRangeInput>
    );

    expect(screen.getByText('Help text for quality')).toBeInTheDocument();
  });

  it('does not render children container when no children provided', () => {
    const onChange = vi.fn();
    const {container} = render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    const descDiv = container.querySelector('[class*="fielddesc"]');
    expect(descDiv).not.toBeInTheDocument();
  });

  it('generates correct IDs for inputs', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="qualityScore"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    expect(screen.getAllByDisplayValue('15')[0]).toHaveAttribute('id', 'qualityScore-range-input');
    expect(screen.getAllByDisplayValue('15')[1]).toHaveAttribute('id', 'qualityScore-number-input');
  });

  it('handles floating point values', () => {
    const onChange = vi.fn();
    render(
      <NumberRangeInput
        name="rate"
        label="Error Rate"
        value={0.1}
        onChange={onChange}
        min={0}
        max={1}
        step={0.1}
      />
    );

    const numberInput = screen.getAllByDisplayValue('0.1')[1];
    fireEvent.change(numberInput, {target: {value: '0.5'}});

    expect(onChange).toHaveBeenCalledWith('rate', 0.5);
  });

  it('updates displayed value when prop changes', () => {
    const onChange = vi.fn();
    const {rerender} = render(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={15}
        onChange={onChange}
      />
    );

    expect(screen.getAllByDisplayValue('15')).toHaveLength(2);

    rerender(
      <NumberRangeInput
        name="quality"
        label="Quality"
        value={25}
        onChange={onChange}
      />
    );

    expect(screen.getAllByDisplayValue('25')).toHaveLength(2);
  });
});
