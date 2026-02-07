import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import React from 'react';

import Collapsable from '../../../../src/components/collapsable';

describe('Collapsable', () => {
  it('applies level classes', () => {
    render(<Collapsable levels={['h2']}><div>content</div></Collapsable>);
    const container = screen.getByText('content').parentElement;
    expect(container?.className).toMatch(/collapse-h2/);
  });
});
