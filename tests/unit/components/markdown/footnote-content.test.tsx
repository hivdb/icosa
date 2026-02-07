import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

// Router + popup shims
vi.mock('found', () => ({
  useRouter: () => ({ router: { push: vi.fn(), replace: vi.fn() }, match: { location: { hash: '' } } }),
  withRouter: (Comp: any) => Comp,
  Link: ({ to, children, ...rest }: any) => <a href={to} {...rest}>{children}</a>
}));
vi.mock('reactjs-popup', () => ({
  default: ({ children, trigger }: any) => (
    <span>
      {trigger}
      <span>{children}</span>
    </span>
  )
}));

import Markdown from '../../../../src/components/markdown';

// Lightweight ref data loader that provides content for any referenced name
function MockRefLoader({ onLoad, setReference, references }: any) {
  React.useEffect(() => {
    for (const ref of references) {
      setReference(ref.name, { ...ref, children: `${ref.name}-CONTENT` }, false);
    }
    onLoad();
  }, [onLoad, setReference, references]);
  return null;
}

describe('Markdown footnote content (inline and deferred)', () => {
  it('expands inline footnotes in-place via #inline', async () => {
    const { container } = render(
      <Markdown refDataLoader={MockRefLoader}>
        {`Intro [^Foo#inline] outro.`}
      </Markdown>
    );
    const para = container.querySelector('p')!;
    await waitFor(() => expect(within(para).queryByText(/Foo-CONTENT/)).toBeTruthy(), { timeout: 3000 });
    // No References section should exist for purely inline refs
    expect(screen.queryByRole('heading', { name: 'References' })).toBeNull();
    expect(screen.queryByText('[1]')).toBeNull();
  });

  it('collects footnotes and renders References section', async () => {
    const { container } = render(
      <Markdown refDataLoader={MockRefLoader}>
        {`Alpha [^Foo]. Beta [^Foo].`}
      </Markdown>
    );
    // Two citations for the same reference (number may not be 1 depending on prior inline refs)
    expect((await screen.findAllByText(/\[\d+\]/)).length).toBe(2);
    const refsHeading = await screen.findByRole('heading', { name: 'References' });
    const refsSection = refsHeading.closest('section') ?? refsHeading.parentElement!;
    const refsList = within(refsSection).getByRole('list');
    // Ensure the formatted reference content appears in the References list
    expect(within(refsList).getByText('Foo-CONTENT')).toBeTruthy();
    // Citations remain in the paragraph
    const para = container.querySelector('p')!;
    expect(within(para).getAllByText(/\[\d+\]/).length).toBe(2);
  });

  it('handles nested emphasis around footnotes', async () => {
    const { container } = render(
      <Markdown refDataLoader={MockRefLoader}>
        {`Alpha *em[^Foo]* and **bold [^Foo]**.`}
      </Markdown>
    );
    expect(await screen.findAllByText('[1]')).toHaveLength(2);
    const refsHeading = await screen.findByRole('heading', { name: 'References' });
    const refsSection = refsHeading.closest('section') ?? refsHeading.parentElement!;
    const refsList = within(refsSection).getByRole('list');
    expect(within(refsList).getByText('Foo-CONTENT')).toBeTruthy();
    const para = container.querySelector('p')!;
    expect(within(para).getAllByText('[1]').length).toBe(2);
  });

  it('renders inline and deferred in the same paragraph', async () => {
    const { container } = render(
      <Markdown refDataLoader={MockRefLoader}>
        {`Mix [^Bar#inline] with a citation [^Foo].`}
      </Markdown>
    );
    // Inline appears directly
    const para = container.querySelector('p')!;
    await waitFor(() => expect(within(para).queryByText(/Bar-CONTENT/)).toBeTruthy(), { timeout: 3000 });
    // Deferred appears as a citation (numbering may shift if inline registered first)
    expect((await screen.findAllByText(/\[\d+\]/)).length).toBe(1);
    // References section includes Foo
    const refsHeading = await screen.findByRole('heading', { name: 'References' });
    const refsSection = refsHeading.closest('section') ?? refsHeading.parentElement!;
    const refsList = within(refsSection).getByRole('list');
    expect(within(refsList).getByText('Foo-CONTENT')).toBeTruthy();
    // And Bar inline content should not be in the references list
    expect(within(refsList).queryByText('Bar-CONTENT')).toBeNull();
  });

  it('skips footnotes inside code and links', async () => {
    const { container } = render(
      <Markdown refDataLoader={MockRefLoader}>
        {`In \`code [^Skip]\` and [link with [^Skip]](https://example.org) but keep [^Foo].`}
      </Markdown>
    );
    // Only one citation for Foo; Skip should be ignored inside code/link
    expect(await screen.findAllByText('[1]')).toHaveLength(1);
    const refsHeading = await screen.findByRole('heading', { name: 'References' });
    const refsSection = refsHeading.closest('section') ?? refsHeading.parentElement!;
    const refsList = within(refsSection).getByRole('list');
    expect(within(refsList).getByText('Foo-CONTENT')).toBeTruthy();
    // Ensure Skip content is not loaded
    expect(screen.queryByText('Skip-CONTENT')).toBeNull();
  });

  it('works across soft line breaks', async () => {
    const { container } = render(
      <Markdown refDataLoader={MockRefLoader}>
        {`Line one [^Baz]\nline two continues.`}
      </Markdown>
    );
    expect(await screen.findAllByText('[1]')).toHaveLength(1);
    const refsHeading = await screen.findByRole('heading', { name: 'References' });
    const refsSection = refsHeading.closest('section') ?? refsHeading.parentElement!;
    const refsList = within(refsSection).getByRole('list');
    expect(within(refsList).getByText('Baz-CONTENT')).toBeTruthy();
  });

  it('expands inline footnotes inside emphasis', async () => {
    const { container } = render(
      <Markdown refDataLoader={MockRefLoader}>
        {`Some *italic [^Bar#inline]* and text.`}
      </Markdown>
    );
    const para = container.querySelector('p')!;
    await waitFor(() => expect(within(para).queryByText(/Bar-CONTENT/)).toBeTruthy(), { timeout: 3000 });
    // No deferred citations
    expect(screen.queryByText('References')).toBeNull();
    expect(screen.queryByText('[1]')).toBeNull();
  });

});
