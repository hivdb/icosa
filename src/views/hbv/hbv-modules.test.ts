import hbvRoutes from './index';
import PrintHeader from './print-header';
import useExtendVariables from './use-extend-variables';
import hbvConfig from './config';
import useApolloClient from './apollo-client';
import {seqLevel, geneSeqLevel} from './common-query.graphql';

import {describe, it, expect} from 'vitest';

describe('HBV core modules', () => {
  it('export basic functions', () => {
    expect(typeof hbvRoutes).toBe('function');
    expect(typeof PrintHeader).toBe('function');
    expect(typeof useExtendVariables).toBe('function');
    expect(typeof useApolloClient).toBe('function');
    expect(hbvConfig).toBeTruthy();
    expect(seqLevel).toBeTypeOf('string');
    expect(geneSeqLevel).toBeTypeOf('string');
  });
});

