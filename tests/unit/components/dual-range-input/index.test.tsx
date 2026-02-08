import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import NumberDualRangeInput from '../../../../src/components/dual-range-input';

describe('NumberDualRangeInput', () => {
  it('triggers onChange on start number input change', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={0}
        end={10}
        onChange={handleChange}
      />
    );
    const input = container.querySelector('input[type="number"][name="s"]') as HTMLInputElement;
    fireEvent.change(input, {target: {value: '1', type: 'number'}});
    expect(handleChange).toHaveBeenCalledWith('s', 1);
  });

  it('triggers onChange on end number input change', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={0}
        end={10}
        onChange={handleChange}
      />
    );
    const input = container.querySelector('input[type="number"][name="e"]') as HTMLInputElement;
    fireEvent.change(input, {target: {value: '8', type: 'number'}});
    expect(handleChange).toHaveBeenCalledWith('e', 8);
  });

  it('triggers onChange on start range input change', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={0}
        end={10}
        onChange={handleChange}
      />
    );
    const input = container.querySelector('input[type="range"][name="s"]') as HTMLInputElement;
    fireEvent.change(input, {target: {value: '3', type: 'range'}});
    expect(handleChange).toHaveBeenCalledWith('s', 3);
  });

  it('triggers onChange on end range input change', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={0}
        end={10}
        onChange={handleChange}
      />
    );
    const input = container.querySelector('input[type="range"][name="e"]') as HTMLInputElement;
    fireEvent.change(input, {target: {value: '7', type: 'range'}});
    expect(handleChange).toHaveBeenCalledWith('e', 7);
  });

  it('respects minGap constraint for start range input', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={0}
        end={10}
        minGap={2}
        onChange={handleChange}
      />
    );
    const input = container.querySelector('input[type="range"][name="s"]') as HTMLInputElement;
    fireEvent.change(input, {target: {value: '9', type: 'range'}});
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('respects minGap constraint for end range input', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={0}
        end={10}
        minGap={2}
        onChange={handleChange}
      />
    );
    const input = container.querySelector('input[type="range"][name="e"]') as HTMLInputElement;
    fireEvent.change(input, {target: {value: '1', type: 'range'}});
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('selects all text on number input click', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={5}
        end={10}
        onChange={handleChange}
      />
    );
    const input = container.querySelector('input[type="number"][name="s"]') as HTMLInputElement;
    const selectSpy = vi.spyOn(input, 'select');
    fireEvent.click(input);
    expect(selectSpy).toHaveBeenCalled();
  });

  it('renders with disabled state', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={0}
        end={10}
        disabled={true}
        onChange={handleChange}
      />
    );
    const inputs = container.querySelectorAll('input');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });

  it('applies custom className', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={0}
        end={10}
        className="custom-class"
        onChange={handleChange}
      />
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('uses custom min, max, and step values', () => {
    const handleChange = vi.fn();
    const {container} = render(
      <NumberDualRangeInput
        nameStart="s"
        nameEnd="e"
        start={10}
        end={50}
        min={10}
        max={100}
        step={5}
        onChange={handleChange}
      />
    );
    const input = container.querySelector('input[type="range"][name="s"]') as HTMLInputElement;
    expect(input).toHaveAttribute('min', '10');
    expect(input).toHaveAttribute('max', '100');
    expect(input).toHaveAttribute('step', '5');
  });
});
