import {renderHook, waitFor} from '@testing-library/react';
import {useCMS, getFullLink, CMSConfig} from './cms';

describe('cms utilities', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({status: 200, text: () => Promise.resolve('payload')}));
    Object.defineProperty(window, 'location', {value: {hostname: 'example.com'}, writable: true});
    (window as any).__SERVER_RENDERING = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('getFullLink resolves stage', () => {
    const cfg: CMSConfig = {cmsStages: {'example.com': 'stage', '*': 'default'}};
    expect(getFullLink('path', cfg)).toBe('https://stage/path');
  });

  it('useCMS loads data', async () => {
    const cfg: CMSConfig = {cmsStages: {'example.com': 'stage', '*': 'default'}};
    const {result} = renderHook(() => useCMS('res', cfg));
    await waitFor(() => expect(result.current[0]).toBe('payload'));
    expect(result.current[1]).toBe(false);
    expect(result.current[2]).toBe(false);
  });
});
