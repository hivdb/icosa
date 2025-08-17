import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import MdHeadingTag from './heading-tags';

describe('Markdown HeadingTag factory', () => {
  it('returns HeadingTag by default', () => {
    const Comp = MdHeadingTag(false);
    const {container} = render(<Comp level={2}>Title</Comp>);
    expect(container.querySelector('a')).not.toBeNull();
  });

  it('disables anchor when requested', () => {
    const Comp = MdHeadingTag(true);
    const {container} = render(<Comp level={2}>Title</Comp>);
    expect(container.querySelector('a')).toBeNull();
  });
});
