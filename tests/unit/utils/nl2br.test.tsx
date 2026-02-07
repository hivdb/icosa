import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import nl2br from '../../../src/utils/nl2br';

describe('nl2br', () => {
  it('replaces newlines with br elements', () => {
    const {container} = render(<span>{nl2br('a\nb')}</span>);
    const br = container.querySelector('br');
    expect(br).not.toBeNull();
    expect(container.textContent).toBe('ab');
  });
});
