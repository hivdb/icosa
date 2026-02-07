vi.mock('graphql-tag.macro', () => ({default: (s: any) => s[0]}));
import {BestMatchingSubtype} from '../../../../src/components/report/fragments.graphql';

test('best matching subtype fragment is defined', () => {
  expect(BestMatchingSubtype).toMatch(/fragment BestMatchingSubtype/);
});
