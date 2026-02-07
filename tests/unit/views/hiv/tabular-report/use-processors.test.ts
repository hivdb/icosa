import {renderHook} from '@testing-library/react';
import useProcessors from '../../../../../src/views/hiv/tabular-report/use-processors';

describe('useProcessors', () => {
  it('selects processors based on options', () => {
    const subOpts = ['A', 'B'];
    const subProcessors = [() => 1, () => 2];
    const config = {formEnableTabularReportOptions: ['B']};
    const match = {location: {query: {}}};
    const {result} = renderHook(() =>
      useProcessors({config, match, subOptions: subOpts, subOptionProcessors: subProcessors})
    );
    expect(result.current).toHaveLength(1);
  });
});
