import {SitesType} from './types';

test('SitesType represents an array of site bins', () => {
  const sites: SitesType = [{percentStart: 0, percentStop: 1, count: 2}];
  expect(sites[0].count).toBe(2);
});
