import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import Loader from '../../../../src/components/loader';
import style from '../../../../src/components/loader/style.module.scss';

describe('Loader', () => {
  it('renders four child divs', () => {
    const {container} = render(<Loader />);
    expect(container.firstChild?.childNodes).toHaveLength(4);
  });

  it('renders with default classes', () => {
    const {container} = render(<Loader />);
    const loader = container.firstChild as HTMLElement;
    expect(loader).toHaveClass(style['lds-ring']);
    expect(loader).not.toHaveClass(style['lds-ring-inline']);
    expect(loader).not.toHaveClass(style['lds-ring-modal']);
  });

  it('renders with inline class when inline prop is true', () => {
    const {container} = render(<Loader inline />);
    const loader = container.firstChild as HTMLElement;
    expect(loader).toHaveClass(style['lds-ring']);
    expect(loader).toHaveClass(style['lds-ring-inline']);
    expect(loader).not.toHaveClass(style['lds-ring-modal']);
  });

  it('renders with modal class when modal prop is true', () => {
    const {container} = render(<Loader modal />);
    const loader = container.firstChild as HTMLElement;
    expect(loader).toHaveClass(style['lds-ring']);
    expect(loader).toHaveClass(style['lds-ring-modal']);
    expect(loader).not.toHaveClass(style['lds-ring-inline']);
  });

  it('does not apply inline class when both modal and inline are true', () => {
    const {container} = render(<Loader modal inline />);
    const loader = container.firstChild as HTMLElement;
    expect(loader).toHaveClass(style['lds-ring']);
    expect(loader).toHaveClass(style['lds-ring-modal']);
    expect(loader).not.toHaveClass(style['lds-ring-inline']);
  });

  it('renders with custom className', () => {
    const {container} = render(<Loader className="custom-loader" />);
    const loader = container.firstChild as HTMLElement;
    expect(loader).toHaveClass(style['lds-ring']);
    expect(loader).toHaveClass('custom-loader');
  });
});
