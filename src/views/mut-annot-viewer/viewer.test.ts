import {renderHook, act} from '@testing-library/react';
import {useSeqViewerSize} from './viewer';

test('useSeqViewerSize persists selection', () => {
  const {result} = renderHook(() => useSeqViewerSize());
  expect(result.current[0]).toBe('middle');
  act(() => result.current[1]('large'));
  expect(window.localStorage.getItem('--sierra-seqviewer-size')).toBe('large');
});
