import {renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import useMessages, {loadMessages, loadMessage} from './use-messages';

describe('useMessages', () => {
  const dict = {hello: 'Hello', world: 'World'};

  it('loads messages array and single message', () => {
    expect(loadMessages(['hello', 'missing'], dict)).toEqual([
      'Hello',
      '<missing>'
    ]);
    expect(loadMessage('world', dict)).toBe('World');
  });

  it('memoizes messages', () => {
    const {result} = renderHook(() => useMessages(['hello'], dict));
    expect(result.current[0]).toBe('Hello');
  });
});
