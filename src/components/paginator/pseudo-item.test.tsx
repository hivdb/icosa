import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import PseudoItem from './pseudo-item';

describe('PseudoItem', () => {
  it('renders nothing', () => {
    const {container} = render(<PseudoItem name="a">A</PseudoItem>);
    expect(container.firstChild).toBeNull();
  });
});
