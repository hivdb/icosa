import {renderHook, act} from '@testing-library/react';

import useOptions from './use-options';

it('provides default options and updates values', () => {
  const {result} = renderHook(() => useOptions());
  const [options, onChange, isDefault] = result.current;
  expect(isDefault).toBe(true);
  expect(options.fastpConfig.includeUnmerged).toBe(true);

  act(() => onChange('fastpConfig.includeUnmerged', false));
  const [updated, , newIsDefault] = result.current;
  expect(updated.fastpConfig.includeUnmerged).toBe(false);
  expect(newIsDefault).toBe(false);
});
