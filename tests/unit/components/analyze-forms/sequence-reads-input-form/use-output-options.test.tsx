import {renderHook} from '@testing-library/react';
import {vi} from 'vitest';

// Mock seq-summary component to avoid JSX parsing issues in dependencies
vi.mock('../../../../../src/components/report/seq-summary', () => ({
  default: () => null,
  MinPositionReads: () => null,
  MaxMixtureRate: () => null,
  MinPrevalence: () => null
}));

import useOutputOptions from '../../../../../src/components/analyze-forms/sequence-reads-input-form/use-output-options';

it('initializes with default option', () => {
  const {result} = renderHook(() => useOutputOptions({outputOptions: {}}));
  expect(result.current.outputOption.name).toBe('__default');
  expect(result.current.outputOptions.__default.label).toBe('HTML');
});

