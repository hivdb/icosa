import {describe, expect, it} from 'vitest';
import shortenMutationList from './shorten-mutation-list';

describe('shortenMutationList', () => {
  it('merges consecutive deletions', () => {
    const muts = [
      {AAs: '-', text: '-1', reference: 'A', position: 1, isUnsequenced: false},
      {AAs: '-', text: '-2', reference: 'B', position: 2, isUnsequenced: false},
      {AAs: 'A', text: 'A3', reference: 'C', position: 3, isUnsequenced: false}
    ];
    const res = shortenMutationList(muts);
    expect(res[0]).toMatchObject({
      text: 'Δ1-2',
      reference: 'AB',
      posStart: 1,
      posEnd: 2
    });
    expect(res[1]).toMatchObject({
      text: 'A3',
      posStart: 3,
      posEnd: 3
    });
  });
});
