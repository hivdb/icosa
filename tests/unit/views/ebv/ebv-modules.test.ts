import ebvRoutes from '../../../../src/views/ebv';
import PrintHeader from '../../../../src/views/ebv/print-header';
import useExtendVariables from '../../../../src/views/ebv/use-extend-variables';
import ebvConfig from '../../../../src/config';
import {describe, it, expect} from 'vitest';

describe('EBV modules', () => {
  it('exports expected functions', () => {
    expect(typeof ebvRoutes).toBe('function');
    expect(typeof PrintHeader).toBe('function');
    expect(typeof useExtendVariables).toBe('function');
    expect(ebvConfig).toBeTruthy();
  });
});
