import {describe, expect, it} from 'vitest';
import {consecutiveGroupsBy, ConsecutiveGroupsByNumber} from './array-groups';

describe('array groups', () => {
  it('groups consecutive numbers', () => {
    const groups = Array.from(ConsecutiveGroupsByNumber([1,2,4,5,6]));
    expect(groups).toEqual([[1,2],[4,5,6]]);
  });

  it('groups by predicate', () => {
    const arr = ['a','ab','abc'];
    const groups = Array.from(consecutiveGroupsBy(arr, (l,r) => r.startsWith(l)));
    expect(groups).toEqual([['a','ab','abc']]);
  });
});
