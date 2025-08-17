import {describe, it, expect, vi} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';

import Button from './index';
import style from './style.module.scss';


describe('Button component', () => {
  it('renders default button with expected classes and type', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).toHaveClass(style.btn);
    expect(btn).toHaveClass(style['btn-normal']);
    expect(btn).toHaveClass(style['btn-style-default']);
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('applies height class when btnHeight is provided', () => {
    render(<Button btnHeight={2}>Tall</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass(style['btn-height-2']);
  });

  it('renders as an external link when href is provided', () => {
    const url = 'https://example.com';
    render(<Button href={url}>Link</Button>);
    const link = screen.getByRole('button');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).not.toHaveAttribute('type');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Press</Button>);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not forward style props to the DOM', () => {
    render(
      <Button btnStyle="info" btnSize="large" btnHeight={3}>
        Styled
      </Button>
    );
    const btn = screen.getByRole('button');
    expect(btn).not.toHaveAttribute('btnStyle');
    expect(btn).not.toHaveAttribute('btnSize');
    expect(btn).not.toHaveAttribute('btnHeight');
  });
});
