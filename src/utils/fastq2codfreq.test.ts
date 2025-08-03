import {describe, expect, it, vi} from 'vitest';
import * as f2c from './fastq2codfreq';
import * as download from './download';

describe('fastq2codfreq', () => {
  // it('restoreTask yields initial progress', async () => {
  //   vi.spyOn(f2c as any, 'fetchRunnerProgress').mockImplementation(async function* () {
  //     yield {step: 'x', count: 1, total: 1};
  //   });
  //   vi.spyOn(f2c as any, 'fetchCodfreqs').mockResolvedValue([]);
  //   const gen = f2c.restoreTask('key');
  //   const first = await gen.next();
  //   expect(first.value.step).toBe('create-task');
  // });

  it('downloadCodfreqs triggers download', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({blob: async () => new Blob()} as any);
    const spy = vi.spyOn(download, 'makeDownload').mockResolvedValue();
    await f2c.downloadCodfreqs('key');
    expect(spy).toHaveBeenCalled();
  });
});
