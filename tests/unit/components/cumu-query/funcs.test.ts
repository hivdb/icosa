import {describe, test, expect} from 'vitest';

import {calcOffsetLimit, calcInitOffsetLimit} from '../../../../src/components/cumu-query/funcs';

describe('cumu-query funcs', () => {
  test('calcOffsetLimit with lazy loading centers around offset', () => {
    const result = calcOffsetLimit({
      size: 10,
      offset: 5,
      lazyLoad: true,
      quickLoadLimit: 5
    });
    expect(result).toEqual({loadFirstIndex: 5, offset: 3, limit: 5});
  });

  test('calcInitOffsetLimit without curIndex and not lazy', () => {
    const result = calcInitOffsetLimit({size: 4, curIndex: null, lazyLoad: false});
    expect(result).toEqual({initOffset: 0, initLimit: 4});
  });
});

