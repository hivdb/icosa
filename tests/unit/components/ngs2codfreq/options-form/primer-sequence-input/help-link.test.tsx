import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom/vitest';

import HelpLink from '../../../../../../src/components/ngs2codfreq/options-form/primer-sequence-input/help-link';

describe('HelpLink', () => {
  it('renders option text correctly', () => {
    render(<HelpLink option="-e" anchor="#error-rate" />);

    expect(screen.getByText(/Cutadapt option "-e"/)).toBeInTheDocument();
  });

  it('renders documentation link', () => {
    render(<HelpLink option="-e" anchor="#error-rate" />);

    const link = screen.getByText('the documentation');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://cutadapt.readthedocs.io/en/v4.1/guide.html#error-rate');
  });

  it('renders with different option', () => {
    render(<HelpLink option="--times" anchor="#times" />);

    expect(screen.getByText(/Cutadapt option "--times"/)).toBeInTheDocument();
  });

  it('constructs correct href with anchor', () => {
    render(<HelpLink option="-O" anchor="#minimum-overlap" />);

    const link = screen.getByText('the documentation');
    expect(link).toHaveAttribute('href', 'https://cutadapt.readthedocs.io/en/v4.1/guide.html#minimum-overlap');
  });

  it('renders line break', () => {
    const {container} = render(<HelpLink option="-e" anchor="#error-rate" />);

    const br = container.querySelector('br');
    expect(br).toBeInTheDocument();
  });

  it('renders "Check" text', () => {
    render(<HelpLink option="-e" anchor="#error-rate" />);

    expect(screen.getByText(/Check/)).toBeInTheDocument();
  });

  it('renders "for more information" text', () => {
    render(<HelpLink option="-e" anchor="#error-rate" />);

    expect(screen.getByText(/for more information/)).toBeInTheDocument();
  });

  it('link opens in new tab', () => {
    render(<HelpLink option="-e" anchor="#error-rate" />);

    const link = screen.getByText('the documentation');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
