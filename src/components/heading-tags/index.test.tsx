import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import {H2} from './index';

describe('HeadingTag', () => {
  it('generates anchor based on text', () => {
    const {container} = render(<H2>My Title</H2>);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '#my.title');
  });

  it('disables anchor when disableAnchor is true', () => {
    const {container} = render(<H2 disableAnchor>Title</H2>);
    expect(container.querySelector('a')).toBeNull();
  });
});

