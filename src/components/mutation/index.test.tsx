import {render} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../utils/use-messages', () => ({
  default: () => ['<mutation-popup>', '', '', '', '', '']
}));

import Mutation from './index';

describe('Mutation', () => {
  it('renders mutation text and data attributes', () => {
    const {container} = render(
      <Mutation
        gene="G"
        text="A1"
        isDRM
        isUnsequenced={false}
        config={{geneDisplay: {}, messages: {}}}
      />
    );
    const item = container.firstChild as HTMLElement;
    expect(item.querySelector('span')?.textContent).toBe('A1');
    expect(item.getAttribute('data-drm')).toBe('true');
  });
});
