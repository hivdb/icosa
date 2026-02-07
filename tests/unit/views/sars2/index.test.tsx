import React from 'react';
import {render, renderHook, act} from '@testing-library/react';
import '@testing-library/jest-dom';
import {ApolloClient} from '@apollo/client';

import sars2Routes from '../../../../src/views/sars2';
import useExtendVariables from '../../../../src/views/sars2/use-extend-variables';
import useApolloClient from '../../../../src/views/sars2/apollo-client';
import PrintHeader from '../../../../src/views/sars2/print-header';
import ConfigContext from '../../../../src/utils/config-context';
import config from '../../../../src/config';
import {pangolinQuery} from '../../../../src/views/sars2/common-query.graphql';
import {loadExampleCodonReads, loadExampleFasta} from '../../../../src/forms/helpers';

describe('sars2 view utilities', () => {
  it('creates routes', () => {
    expect(React.isValidElement(sars2Routes())).toBe(true);
  });

  it('extends variables', () => {
    const {result} = renderHook(() => useExtendVariables({
      config: {drdbVersion: '1', cmtVersion: '2'},
      match: {location: {}}
    }));
    const vars = result.current({});
    expect(vars.drdbVersion).toBe('1');
    expect(vars.cmtVersion).toBe('2');
  });

  it('handles undefined config when extending variables', () => {
    const {result} = renderHook(() => useExtendVariables({
      match: {location: {}}
    }));
    const vars = result.current({foo: 'bar'});
    expect(vars.foo).toBe('bar');
  });

  it('creates an apollo client', () => {
    const {result} = renderHook(() => useApolloClient({config: {graphqlURI: '/graphql'}}));
    expect(result.current).toBeInstanceOf(ApolloClient);
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

  it('has config values', () => {
    expect(config).toHaveProperty('graphqlURI');
  });

  it('generates pangolin query', () => {
    expect(pangolinQuery()).toContain('pangolin');
  });

  it('loads example links', () => {
    const conf = {cmsStages: {localhost: 'example.com', '*': 'example.com'}};
    const reads = loadExampleCodonReads(['foo'], conf);
    const fasta = loadExampleFasta([{url: 'bar', title: 't'}], conf);
    expect(reads[0]).toContain('foo');
    expect(fasta[0].url).toContain('bar');
  });

  it('provides helper functions', () => {
    expect(typeof loadExampleCodonReads).toBe('function');
  });
});
