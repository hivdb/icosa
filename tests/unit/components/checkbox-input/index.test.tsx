import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import CheckboxInput from '../../../../src/components/checkbox-input';

describe('CheckboxInput', () => {
  it('handles click and space key to toggle', () => {
    const handleChange = vi.fn();
    render(
      <CheckboxInput
        id="c1"
        name="cgroup"
        value="1"
        onChange={handleChange}
      >Check</CheckboxInput>
    );
    const input = screen.getByLabelText('Check');
    fireEvent.click(input);
    fireEvent.keyDown(input.parentElement!, {key: ' '});
    expect(handleChange).toHaveBeenCalledTimes(2);
  });
});

