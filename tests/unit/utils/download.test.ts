import {renderHook, act} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import * as download from '../../../src/utils/download';

// stub showSaveFilePicker

describe('download utilities', () => {
  it('calls file picker when available', async () => {
    const picker = vi.fn();
    (window as any).showSaveFilePicker = picker;
    await download.showFilePicker('foo');
    expect(picker).toHaveBeenCalled();
  });

  // it('creates zip and triggers download', async () => {
  //   (global as any).URL = {createObjectURL: vi.fn()};
  //   const spy = vi.spyOn(download, 'makeDownload').mockResolvedValue();
  //   await download.makeZip('a.zip', [{fileName: 'a.txt', data: 'hi'}]);
  //   expect(spy).toHaveBeenCalled();
  //   spy.mockRestore();
  // });

  // it('useDownload initializes via picker', async () => {
  //   const picker = vi.fn().mockResolvedValue({});
  //   (window as any).showSaveFilePicker = picker;
  //   const {result} = renderHook(() => download.useDownload({name: 'f', suffix: '.txt', types: []}));
  //   await act(async () => {await result.current.onInit();});
  //   expect(picker).toHaveBeenCalled();
  // });
});
