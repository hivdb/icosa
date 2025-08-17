import {newPatternObj} from './index';

it('creates unique pattern object', () => {
  const pat = newPatternObj();
  expect(pat).toHaveProperty('uuid');
  expect(pat).toHaveProperty('name', pat.uuid);
  expect(pat.mutations).toEqual([]);
});

