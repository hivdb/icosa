import ebvRoutes from './index';
import PrintHeader from './print-header';
import useExtendVariables from './use-extend-variables';
import ebvConfig from './config';
import {describe, it, expect} from 'vitest';

describe('EBV modules', () => {
  it('exports expected functions', () => {
    expect(typeof ebvRoutes).toBe('function');
    expect(typeof PrintHeader).toBe('function');
    expect(typeof useExtendVariables).toBe('function');
    expect(ebvConfig).toBeTruthy();
  });
});
