import React from 'react';
import gql from 'graphql-tag';

import StatTable from './stat-table';
import ValidationReport from '../validation-report';
// import StatHistogram from './stat-histogram';
import config from '../../../config';

import style from './style.module.scss';

export const query = gql`
  fragment SequenceReadsHistogramQuery on SequenceReadsAnalysis {
    histogram(
      binTicks: [0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5]
    ) {
      numPositions
    ${(config as any).mutStatTableColumns.filter(({query}: any) => !!query)
    .map(({name, query}: any) => (
      `${name}: ${query} { percentStart, percentStop, count }`
    )).join('\n')}
    }
  }
`;

export interface MutationStatsProps {
  /** Histogram data for the statistics table. */
  histogram?: Record<string, any>;
  /** Currently selected minimum prevalence cutoff. */
  minPrevalence?: number;
  /** Validation results for the sequence reads. */
  validationResults?: Record<string, any>;
  /** Router used to navigate when cutoff is changed. */
  router: { push: (loc: any) => void };
  /** Match object describing current location. */
  match: { location: any };
}

/**
 * Display mutation statistics alongside validation results.
 *
 * @param props - {@link MutationStatsProps} data and navigation helpers.
 * @returns A section containing mutation statistics table and validation report.
 */
export default function MutationStats({
  histogram = {},
  minPrevalence: curCutoff,
  match,
  router,
  validationResults
}: MutationStatsProps) {
  return (
    <section className={style['report-mutation-stats']}>
      <h2>Multi-threshold mutation summary table</h2>
      <div className={style['report-mutation-stats-inner']}>
        <StatTable
          {...histogram}
          {...{match, router}}
          currentCutoff={curCutoff}
        />
        <ValidationReport
          {...{validationResults}}
          placeholder="No validation issue was found for the sequence reads."
        />
      </div>
    </section>
  );
}
