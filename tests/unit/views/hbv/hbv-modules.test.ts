import hbvRoutes from '../../../../src/views/hbv';
import PrintHeader from '../../../../src/views/hbv/print-header';
import useExtendVariables from '../../../../src/views/hbv/use-extend-variables';
import hbvConfig from '../../../../src/config';
import useApolloClient from '../../../../src/views/hbv/apollo-client';
import {seqLevel, geneSeqLevel} from '../../../../src/views/hbv/common-query.graphql';

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

