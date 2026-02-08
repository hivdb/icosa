import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect} from 'vitest';
import React from 'react';

import Collapsable from '../../../../src/components/collapsable';

describe('Collapsable', () => {
  it('applies level classes', () => {
    render(<Collapsable levels={['h2']}><div>content</div></Collapsable>);
    const container = screen.getByText('content').parentElement;
    expect(container?.className).toMatch(/collapse-h2/);
  });

  it('applies default h3 level when no levels provided', () => {
    render(<Collapsable><div>default content</div></Collapsable>);
    const container = screen.getByText('default content').parentElement;
    expect(container?.className).toMatch(/collapse-h3/);
  });

  it('applies multiple level classes', () => {
    render(<Collapsable levels={['h2', 'h4', 'h5']}><div>multi</div></Collapsable>);
    const container = screen.getByText('multi').parentElement;
    expect(container?.className).toMatch(/collapse-h2/);
    expect(container?.className).toMatch(/collapse-h4/);
    expect(container?.className).toMatch(/collapse-h5/);
  });

  it('applies collapsable base class', () => {
    render(<Collapsable><div>base</div></Collapsable>);
    const container = screen.getByText('base').parentElement;
    expect(container?.className).toMatch(/collapsable/);
  });

  it('renders children correctly', () => {
    render(
      <Collapsable>
        <div>child 1</div>
        <div>child 2</div>
      </Collapsable>
    );
    expect(screen.getByText('child 1')).toBeInTheDocument();
    expect(screen.getByText('child 2')).toBeInTheDocument();
  });

  it('provides Section component', () => {
    expect(Collapsable.Section).toBeDefined();
    expect(typeof Collapsable.Section).toBe('object');
  });
});
