import React from 'react';
import {render, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {describe, it, expect} from 'vitest';

import ebvRoutes from './index';
import PrintHeader from './print-header';
import useExtendVariables from './use-extend-variables';
import ebvConfig from './config';
import ConfigContext from '../../utils/config-context';
import {loadExampleCodonReads, loadExampleFasta} from './forms';

describe('EBV modules', () => {
  it('exports expected functions', () => {
    expect(typeof ebvRoutes).toBe('function');
    expect(typeof PrintHeader).toBe('function');
    expect(typeof useExtendVariables).toBe('function');
    expect(ebvConfig).toBeTruthy();
  });

  it('renders print header', () => {
    const cfg = {messages: {'sequence-analysis-report-title': 'Title'}};
    let getByText: any;
    act(() => {
      const result = render(
        <ConfigContext.Provider value={[cfg, false] as any}>
          <PrintHeader curAnalysis="sequence-analysis" />
        </ConfigContext.Provider>
      );
      getByText = result.getByText;
    });
    expect(getByText('Print')).toBeInTheDocument();
  });

  it('loads example links', () => {
    const conf = {cmsStages: {localhost: 'example.com', '*': 'example.com'}};
    const reads = loadExampleCodonReads(['foo'], conf);
    const fasta = loadExampleFasta([{url: 'bar', title: 't'}], conf);
    expect(reads[0]).toContain('foo');
    expect(fasta[0].url).toContain('bar');
  });
});
