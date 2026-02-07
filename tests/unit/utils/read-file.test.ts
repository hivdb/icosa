import {describe, expect, it} from 'vitest';
import {gzip} from 'pako';
import readFile from '../../../src/utils/read-file';

describe('readFile', () => {
  it('reads text files', async () => {
    const file = new File(['hello'], 't.txt', {type: 'text/plain'});
    await expect(readFile(file)).resolves.toBe('hello');
  });
  it('reads gzip files', async () => {
    const g = gzip('hi');
    const file = new File([g.buffer as ArrayBuffer], 't.gz', {
      type: 'application/x-gzip'
    });
    await expect(readFile(file)).resolves.toBe('hi');
  });
});
