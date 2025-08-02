import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

import RadioInput from './index';

describe('RadioInput', () => {
  it('triggers onChange when selected', () => {
    const handleChange = vi.fn();
    render(
      <RadioInput
        id="r1"
        name="group"
        value="a"
        checked={false}
        onChange={handleChange}
      >Label</RadioInput>
    );
    fireEvent.click(screen.getByLabelText('Label'));
    expect(handleChange).toHaveBeenCalled();
  });
});

