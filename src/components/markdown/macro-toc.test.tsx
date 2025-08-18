import {render} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import '@testing-library/jest-dom';

import TOCNodeWrapper, {tocMacro} from './macro-toc';

describe('TOCNodeWrapper', () => {
  it('combines class names from props and wrapper', () => {
    const Wrapper = TOCNodeWrapper({className: 'global'});
    const {container} = render(
      <Wrapper props={{className: 'local'}}>
        <div>Item</div>
      </Wrapper>
    );
    const div = container.querySelector('div');
    expect(div?.className).toContain('global');
    expect(div?.className).toContain('local');
  });

  it('registers toc macro', () => {
    const node = tocMacro('content', {}, {} as any);
    expect((node as any).markdown).toBe('content');
    expect(node.type).toBe('TOCNode');
  });
});
