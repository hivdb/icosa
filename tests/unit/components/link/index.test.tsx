import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('found', () => ({
  Link: ({to, children, ...props}: any) => <a href={to} {...props}>{children}</a>
}));

import Link from '../../../../src/components/link';
import style from '../../../../src/components/link/style.module.scss';

describe('Link', () => {
  it('renders with internal route using Found Link', () => {
    render(<Link to="/test">Internal Link</Link>);
    const link = screen.getByText('Internal Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders with external href using anchor tag', () => {
    render(<Link href="https://example.com">External Link</Link>);
    const link = screen.getByText('External Link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('applies default link style', () => {
    render(<Link to="/test">Link</Link>);
    const link = screen.getByText('Link');
    expect(link).toHaveClass(style.link);
  });

  it('does not apply default style when noDefaultStyle is true', () => {
    render(<Link to="/test" noDefaultStyle>Link</Link>);
    const link = screen.getByText('Link');
    expect(link).not.toHaveClass(style.link);
  });

  it('applies custom className', () => {
    render(<Link to="/test" className="custom-class">Link</Link>);
    const link = screen.getByText('Link');
    expect(link).toHaveClass('custom-class');
    expect(link).toHaveClass(style.link);
  });

  it('applies help link style', () => {
    render(<Link to="/help" linkStyle="help">Help Link</Link>);
    const link = screen.getByText('Help Link');
    expect(link).toHaveClass(style['help-link']);
    expect(link).toHaveClass(style.link);
  });

  it('opens help link in new window on click', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<Link to="/help" linkStyle="help">Help Link</Link>);
    const link = screen.getByText('Help Link');
    fireEvent.click(link);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      '/help',
      '_sierra-help-window',
      'width=960,height=700,resizable,scrollbars=yes,menubar=no,toolbar=no,personalbar=no,status=no'
    );
    windowOpenSpy.mockRestore();
  });

  it('calls onClick handler after opening help window', () => {
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const onClickSpy = vi.fn();
    render(<Link to="/help" linkStyle="help" onClick={onClickSpy}>Help Link</Link>);
    const link = screen.getByText('Help Link');
    fireEvent.click(link);
    expect(windowOpenSpy).toHaveBeenCalled();
    expect(onClickSpy).toHaveBeenCalled();
    windowOpenSpy.mockRestore();
  });

  it('calls onClick handler for non-help links', () => {
    const onClickSpy = vi.fn();
    render(<Link to="/test" onClick={onClickSpy}>Link</Link>);
    const link = screen.getByText('Link');
    fireEvent.click(link);
    expect(onClickSpy).toHaveBeenCalled();
  });

  it('renders with route object', () => {
    render(<Link to={{pathname: '/test', query: {id: '1'}}}>Link</Link>);
    expect(screen.getByText('Link')).toBeInTheDocument();
  });

  it('passes through additional anchor attributes', () => {
    render(<Link href="https://example.com" target="_blank" rel="noopener">Link</Link>);
    const link = screen.getByText('Link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });

  it('does not apply link styles when noDefaultStyle is true', () => {
    render(<Link to="/help" linkStyle="help" noDefaultStyle>Help Link</Link>);
    const link = screen.getByText('Help Link');
    expect(link).not.toHaveClass(style['help-link']);
    expect(link).not.toHaveClass(style.link);
  });
});
