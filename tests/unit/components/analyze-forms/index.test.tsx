import {getBasePath} from '../../../../src/components/analyze-forms/use-base-path';

it('computes base path from location', () => {
  const base = getBasePath('/foo/bar/');
  expect(base).toBe('/foo');
});

