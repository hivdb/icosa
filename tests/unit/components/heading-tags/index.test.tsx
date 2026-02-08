import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {getAnchor, getChildrenText, HeadingTag, H1, H2, H3, H4, H5, H6} from '../../../../src/components/heading-tags';

describe('HeadingTag utilities', () => {
  it('derives anchor from HeadingTag children', () => {
    const anchor = getAnchor(<HeadingTag level={2}>Hello World</HeadingTag>);
    expect(anchor).toBe('hello.world');
  });

  it('derives anchor from generic nodes', () => {
    const anchor = getAnchor(<span>Generic Text</span>);
    expect(anchor).toBe('generic.text');
  });

  it('extracts text from children', () => {
    const text = getChildrenText(<div>Test <span>Content</span></div>);
    expect(text).toBe('Test Content');
  });
});

describe('HeadingTag component', () => {
  let originalHash: string;
  let scrollToSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalHash = window.location.hash;
    scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    window.location.hash = originalHash;
    scrollToSpy.mockRestore();
  });

  it('renders h1 element with correct level', () => {
    render(<HeadingTag level={1}>Heading 1</HeadingTag>);
    const heading = screen.getByText('Heading 1');
    expect(heading.tagName).toBe('H1');
  });

  it('renders h2 element with correct level', () => {
    render(<HeadingTag level={2}>Heading 2</HeadingTag>);
    const heading = screen.getByText('Heading 2');
    expect(heading.tagName).toBe('H2');
  });

  it('generates anchor from children', () => {
    render(<HeadingTag level={2}>Test Heading</HeadingTag>);
    const heading = screen.getByText('Test Heading');
    expect(heading).toHaveAttribute('id', 'test.heading');
  });

  it('uses custom id when provided', () => {
    render(<HeadingTag level={2} id="custom-id">Test</HeadingTag>);
    const heading = screen.getByText('Test');
    expect(heading).toHaveAttribute('id', 'custom-id');
  });

  it('renders anchor link by default', () => {
    render(<HeadingTag level={2}>Test</HeadingTag>);
    const link = document.querySelector('a[data-anchor-link]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#test');
  });

  it('hides anchor link when disableAnchor is true', () => {
    render(<HeadingTag level={2} disableAnchor>Test</HeadingTag>);
    const link = document.querySelector('a[data-anchor-link]');
    expect(link).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<HeadingTag level={2} className="custom-class">Test</HeadingTag>);
    const heading = screen.getByText('Test');
    expect(heading).toHaveClass('custom-class');
  });

  it('scrolls to element when hash matches anchor', async () => {
    window.location.hash = '#test.heading';
    const {container} = render(<HeadingTag level={2}>Test Heading</HeadingTag>);
    
    await vi.waitFor(() => {
      expect(scrollToSpy).toHaveBeenCalled();
    }, {timeout: 100});
  });

  it('does not scroll when hash does not match', () => {
    window.location.hash = '#different';
    render(<HeadingTag level={2}>Test Heading</HeadingTag>);
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('does not scroll when anchor is empty', () => {
    window.location.hash = '#';
    render(<HeadingTag level={2} id="">Test</HeadingTag>);
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('forwards additional props to heading element', () => {
    render(<HeadingTag level={2} data-testid="test-heading">Test</HeadingTag>);
    const heading = screen.getByTestId('test-heading');
    expect(heading).toBeInTheDocument();
  });
});

describe('Heading wrapper components', () => {
  it('H1 renders with level 1', () => {
    render(<H1>H1 Content</H1>);
    const heading = screen.getByText('H1 Content');
    expect(heading.tagName).toBe('H1');
  });

  it('H2 renders with level 2', () => {
    render(<H2>H2 Content</H2>);
    const heading = screen.getByText('H2 Content');
    expect(heading.tagName).toBe('H2');
  });

  it('H3 renders with level 3', () => {
    render(<H3>H3 Content</H3>);
    const heading = screen.getByText('H3 Content');
    expect(heading.tagName).toBe('H3');
  });

  it('H4 renders with level 4', () => {
    render(<H4>H4 Content</H4>);
    const heading = screen.getByText('H4 Content');
    expect(heading.tagName).toBe('H4');
  });

  it('H5 renders with level 5', () => {
    render(<H5>H5 Content</H5>);
    const heading = screen.getByText('H5 Content');
    expect(heading.tagName).toBe('H5');
  });

  it('H6 renders with level 6', () => {
    render(<H6>H6 Content</H6>);
    const heading = screen.getByText('H6 Content');
    expect(heading.tagName).toBe('H6');
  });
});
