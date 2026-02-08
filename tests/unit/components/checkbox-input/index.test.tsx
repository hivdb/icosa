import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

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

  it('renders with checked state', () => {
    const handleChange = vi.fn();
    render(
      <CheckboxInput
        id="c2"
        name="cgroup"
        value="2"
        checked={true}
        onChange={handleChange}
      >Checked</CheckboxInput>
    );
    const input = screen.getByLabelText('Checked') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('renders with disabled state', () => {
    const handleChange = vi.fn();
    render(
      <CheckboxInput
        id="c3"
        name="cgroup"
        value="3"
        disabled={true}
        onChange={handleChange}
      >Disabled</CheckboxInput>
    );
    const input = screen.getByLabelText('Disabled');
    expect(input).toBeDisabled();
  });

  it('applies custom className', () => {
    const handleChange = vi.fn();
    render(
      <CheckboxInput
        id="c4"
        name="cgroup"
        value="4"
        className="custom-class"
        onChange={handleChange}
      >Custom</CheckboxInput>
    );
    const wrapper = screen.getByLabelText('Custom').parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('applies custom inline styles to label', () => {
    const handleChange = vi.fn();
    const customStyle = {color: 'red', fontSize: '16px'};
    render(
      <CheckboxInput
        id="c5"
        name="cgroup"
        value="5"
        style={customStyle}
        onChange={handleChange}
      >Styled</CheckboxInput>
    );
    const label = screen.getByText('Styled');
    expect(label).toHaveAttribute('style');
    expect(label.style.color).toBeTruthy();
  });

  it('ignores non-space keys', () => {
    const handleChange = vi.fn();
    render(
      <CheckboxInput
        id="c6"
        name="cgroup"
        value="6"
        onChange={handleChange}
      >Test</CheckboxInput>
    );
    const wrapper = screen.getByLabelText('Test').parentElement!;
    fireEvent.keyDown(wrapper, {key: 'Enter'});
    expect(handleChange).not.toHaveBeenCalled();
  });
});

