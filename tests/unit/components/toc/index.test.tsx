import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import BasicTOC, {AutoTOC} from '../../../../src/components/toc';

describe('TOC components', () => {
  it('renders children inside nav in BasicTOC', () => {
    const {container} = render(<BasicTOC><div>Item</div></BasicTOC>);
    expect(container.querySelector('nav')?.textContent).toContain('Item');
  });

  it('AutoTOC generates links from headings', () => {
    const {container} = render(
      <AutoTOC>
        <h1 id="h1">Heading</h1>
      </AutoTOC>
    );
    expect(container.querySelector('a[href="#h1"]')).toBeInTheDocument();
  });
});
