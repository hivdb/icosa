import {renderHook, act} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import useDownloadCodFreqs from '../../../../src/components/report/download-codfreqs';
import * as download from '../../../../src/utils/download';

describe('useDownloadCodFreqs', () => {
  it('downloads single file', async () => {
    const makeDownload = vi.spyOn(download, 'makeDownload').mockResolvedValue(undefined);
    const data = [
      {
        name: 'sample.codfreq',
        allReads: [
          {
            gene: 'g',
            position: 1,
            totalReads: 10,
            allCodonReads: [{codon: 'ATG', reads: 10}]
          }
        ]
      }
    ];
    const {result} = renderHook(() => useDownloadCodFreqs(data));
    await act(async () => {
      await result.current.onDownload();
    });
    expect(makeDownload).toHaveBeenCalled();
  });

  it('zips multiple files', async () => {
    const makeZip = vi.spyOn(download, 'makeZip').mockResolvedValue(undefined);
    const data = [
      {
        name: 'a.codfreq',
        allReads: [
          {
            gene: 'g',
            position: 1,
            totalReads: 10,
            allCodonReads: [{codon: 'ATG', reads: 10}]
          }
        ]
      },
      {
        name: 'b.codfreq',
        allReads: [
          {
            gene: 'g',
            position: 1,
            totalReads: 10,
            allCodonReads: [{codon: 'ATG', reads: 10}]
          }
        ]
      }
    ];
    const {result} = renderHook(() => useDownloadCodFreqs(data));
    await act(async () => {
      await result.current.onDownload();
    });
    expect(makeZip).toHaveBeenCalled();
  });
});

