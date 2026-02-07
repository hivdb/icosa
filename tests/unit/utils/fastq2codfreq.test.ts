import {describe, expect, it, vi} from 'vitest';
import * as f2c from '../../../src/utils/fastq2codfreq';
import * as download from '../../../src/utils/download';

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

  it('saveAllFiles fetches all remote files', async () => {
    const fileBlob = new Blob();
    const firstFetch = {
      json: async () => ({
        isTruncated: false,
        files: [{fileName: 'a.txt', url: 'http://example.com/a.txt'}]
      })
    };
    const secondFetch = {blob: async () => fileBlob};
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(firstFetch as any)
      .mockResolvedValueOnce(secondFetch as any);
    const onAddFile = vi.fn();
    const onFinish = vi.fn();
    await f2c.saveAllFiles('task', {onAddFile, onFinish});
    expect(onAddFile).toHaveBeenCalledWith({
      fileName: 'a.txt',
      data: fileBlob,
      isBlob: true
    });
    expect(onFinish).toHaveBeenCalled();
  });
});
