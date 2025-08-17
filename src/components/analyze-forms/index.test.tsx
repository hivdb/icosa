import {getBasePath} from './use-base-path';

it('computes base path from location', () => {
  const base = getBasePath('/foo/bar/');
  expect(base).toBe('/foo');
});

