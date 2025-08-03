import {describe, expect, it, vi} from 'vitest';

vi.mock('../../utils/download', () => ({
  makeZip: vi.fn(),
  makeDownload: vi.fn()
}));

import {makeZip, makeDownload} from '../../utils/download';
import useTabularReports, {TabularReportProcessor} from './reports';

describe('useTabularReports', () => {
  it('downloads single file directly', async () => {
    const processor: TabularReportProcessor = async () => [{
      folder: 'f',
      tableName: 't',
      payload: 'data',
      fileExt: '.txt',
      mimeType: 'text/plain'
    }];
    const onFinish = vi.fn();
    useTabularReports({
      loaded: true,
      subOptionProcessors: [processor],
      children: [0],
      allGenes: [],
      onFinish
    });
    await new Promise(r => setTimeout(r, 0));
    expect(makeDownload).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
  });

  it('zips multiple files', async () => {
    const processor: TabularReportProcessor = async () => [
      {folder: 'f', tableName: 't', payload: 'data'},
      {folder: 'f', tableName: 't2', payload: 'data2'}
    ];
    useTabularReports({
      loaded: true,
      subOptionProcessors: [processor],
      children: [0],
      allGenes: [],
      onFinish: () => {}
    });
    await new Promise(r => setTimeout(r, 0));
    expect(makeZip).toHaveBeenCalled();
  });
});
