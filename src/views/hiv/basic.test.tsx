import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import PrintHeader from './print-header';
import useDisabledDrugs from './use-disabled-drugs';
import useExtendVariables from './use-extend-variables';
import hiv1Routes from './index';
import useAlgorithmSelector from './forms/algorithm-selector';
import useDrugDisplayOptions from './forms/drug-display-options';
import ReportByPatterns from './report-by-patterns';
import PatternReports from './report-by-patterns/reports';
import SinglePatternReport from './report-by-patterns/single-report';
import useApolloClient from './apollo-client';
import config from './config';
import * as commonQuery from './common-query.graphql';
import { ConfigContext } from '../../components/report';

describe('hiv view modules', () => {
  it('exports route factory', () => {
    expect(typeof hiv1Routes).toBe('function');
  });

  it('renders PrintHeader without crashing', () => {
    render(
      <ConfigContext.Provider value={[{ messages: {} }, false]}>
        <PrintHeader />
      </ConfigContext.Provider>
    );
  });

  it('exposes hooks and components', () => {
    expect(typeof useDisabledDrugs).toBe('function');
    expect(typeof useExtendVariables).toBe('function');
    expect(typeof useAlgorithmSelector).toBe('function');
    expect(typeof useDrugDisplayOptions).toBe('function');
    expect(typeof useApolloClient).toBe('function');
    expect(typeof config).toBe('object');
    expect(typeof commonQuery.rootLevel).toBe('string');
    expect(typeof ReportByPatterns).toBe('function');
    expect(typeof PatternReports).toBe('function');
    expect(typeof SinglePatternReport).toBe('function');
  });
});
