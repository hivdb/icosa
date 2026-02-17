import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';

import AdapterTrimmingSwitch from '../../../../../src/components/ngs2codfreq/options-form/adapter-trimming-switch';

describe('AdapterTrimmingSwitch', () => {
  it('renders label correctly', () => {
    const onChange = vi.fn();
    render(<AdapterTrimmingSwitch disableAdapterTrimming={false} onChange={onChange} />);

    expect(screen.getByText('Adapter trimming:')).toBeInTheDocument();
  });

  it('renders Yes and No radio options', () => {
    const onChange = vi.fn();
    render(<AdapterTrimmingSwitch disableAdapterTrimming={false} onChange={onChange} />);

    expect(screen.getByLabelText('Yes')).toBeInTheDocument();
    expect(screen.getByLabelText('No')).toBeInTheDocument();
  });

  it('checks Yes when disableAdapterTrimming is false', () => {
    const onChange = vi.fn();
    render(<AdapterTrimmingSwitch disableAdapterTrimming={false} onChange={onChange} />);

    const yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    const noRadio = screen.getByLabelText('No') as HTMLInputElement;

    expect(yesRadio.checked).toBe(true);
    expect(noRadio.checked).toBe(false);
  });

  it('checks No when disableAdapterTrimming is true', () => {
    const onChange = vi.fn();
    render(<AdapterTrimmingSwitch disableAdapterTrimming={true} onChange={onChange} />);

    const yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    const noRadio = screen.getByLabelText('No') as HTMLInputElement;

    expect(yesRadio.checked).toBe(false);
    expect(noRadio.checked).toBe(true);
  });

  it('calls onChange with false when Yes is clicked', () => {
    const onChange = vi.fn();
    render(<AdapterTrimmingSwitch disableAdapterTrimming={true} onChange={onChange} />);

    const yesRadio = screen.getByLabelText('Yes');
    fireEvent.click(yesRadio);

    expect(onChange).toHaveBeenCalledWith('fastpConfig.disabledAdapterTrimming', false);
  });

  it('calls onChange with true when No is clicked', () => {
    const onChange = vi.fn();
    render(<AdapterTrimmingSwitch disableAdapterTrimming={false} onChange={onChange} />);

    const noRadio = screen.getByLabelText('No');
    fireEvent.click(noRadio);

    expect(onChange).toHaveBeenCalledWith('fastpConfig.disabledAdapterTrimming', true);
  });

  it('generates correct IDs for radio buttons', () => {
    const onChange = vi.fn();
    render(<AdapterTrimmingSwitch disableAdapterTrimming={false} onChange={onChange} />);

    expect(screen.getByLabelText('Yes')).toHaveAttribute('id', 'adapterTrimming-enable');
    expect(screen.getByLabelText('No')).toHaveAttribute('id', 'adapterTrimming-disable');
  });

  it('updates checked state when prop changes', () => {
    const onChange = vi.fn();
    const {rerender} = render(
      <AdapterTrimmingSwitch disableAdapterTrimming={false} onChange={onChange} />
    );

    let yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    expect(yesRadio.checked).toBe(true);

    rerender(<AdapterTrimmingSwitch disableAdapterTrimming={true} onChange={onChange} />);

    yesRadio = screen.getByLabelText('Yes') as HTMLInputElement;
    const noRadio = screen.getByLabelText('No') as HTMLInputElement;
    expect(yesRadio.checked).toBe(false);
    expect(noRadio.checked).toBe(true);
  });
});
