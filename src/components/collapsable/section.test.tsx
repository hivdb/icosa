import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect} from 'vitest';
import React from 'react';

import {SectionInner} from './section';
import Context, {CollapsableContextValue} from './context';

function setup() {
  const containerRef = {current: document.createElement('div')};
  const ctx = new CollapsableContextValue(containerRef as any, ['h3']);
  return ctx;
}

describe('SectionInner', () => {
  it('toggles expansion', () => {
    const ctx = setup();
    render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={3}
          match={{location: {hash: ''}}}
          router={{}}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <h3 id="sec">Title</h3>
          <div>Body</div>
        </SectionInner>
      </Context.Provider>
    );
    const toggle = screen.getByLabelText('collapse');
    fireEvent.click(toggle);
    expect(screen.getByLabelText('expand')).toBeInTheDocument();
  });

  it('does not leak router/match props to DOM', () => {
    const ctx = setup();
    const {container} = render(
      <Context.Provider value={ctx}>
        <SectionInner
          level={2}
          match={{location: {hash: ''}}}
          router={{}}
          registerCollapsableAnchor={ctx.registerCollapsableAnchor}
          getClosestCollapsableAnchor={ctx.getClosestCollapsableAnchor}
        >
          <h2 id="sec2">Title</h2>
        </SectionInner>
      </Context.Provider>
    );
    const section = container.querySelector('section');
    expect(section).not.toBeNull();
    expect(section?.getAttribute('router')).toBeNull();
    expect(section?.getAttribute('match')).toBeNull();
  });
});
