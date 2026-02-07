import {render, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import NumberDualRangeInput from '../../../../src/components/dual-range-input';

describe('NumberDualRangeInput', () => {
  it('triggers onChange on start input change', () => {
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
    const input = container.querySelector('input[name="s"]') as HTMLInputElement;
    fireEvent.change(input, {target: {value: '1'}});
    expect(handleChange).toHaveBeenCalledWith('s', 1);
  });
});
