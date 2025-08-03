import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('found', () => ({
  Link: ({to, ...props}: any) => <a data-testid="found-link" href={to} {...props} />
}));

import MarkdownLink from './link';

describe('MarkdownLink', () => {
  it('renders external links with target _blank', () => {
    const {container} = render(<MarkdownLink href="https://example.com">ext</MarkdownLink>);
    const anchor = container.querySelector('a');
    expect(anchor).toHaveAttribute('href', 'https://example.com');
    expect(anchor).toHaveAttribute('target', '_blank');
  });

  it('renders internal links with Link component', () => {
    const {getByTestId} = render(<MarkdownLink href="/about">About</MarkdownLink>);
    const link = getByTestId('found-link');
    expect(link).toHaveAttribute('href', '/about');
  });
});
