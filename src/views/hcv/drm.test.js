import {isMajorMutation, mutationGroups} from './drm';

describe('HCV mutation groups', () => {
  test('uses the HCV DRM list and keeps other mutations separate', () => {
    const mutations = [
      {position: 80, reference: 'Q', AAs: 'R', text: 'Q80R'},
      {position: 87, reference: 'A', AAs: 'S', text: 'A87S'}
    ];
    const groups = mutationGroups('NS3', mutations);

    expect(groups.map(({mutationType}) => mutationType))
      .toEqual(['Major', 'Other']);
    expect(groups[0].mutations.map(({text}) => text)).toEqual(['Q80R']);
    expect(groups[1].mutations.map(({text}) => text)).toEqual(['A87S']);
    expect(groups[0].mutations[0].isDRM).toBe(true);
    expect(groups[1].mutations[0].isDRM).toBe(false);
  });

  test('recognizes mixed calls, deletions, and special mutations', () => {
    expect(isMajorMutation('NS5B', {
      position: 282, reference: 'S', AAs: 'GT'
    })).toBe(true);
    expect(isMajorMutation('NS5A_NTD', {
      position: 29, reference: 'P', AAs: '-'
    })).toBe(true);
    expect(isMajorMutation('NS5A_NTD', {
      position: 28, reference: 'F', AAs: 'V'
    })).toBe(true);
    expect(isMajorMutation('NS5A_NTD', {
      position: 93, reference: 'Y', AAs: 'T'
    })).toBe(true);
  });
});
