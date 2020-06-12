import React from 'react';
import gql from 'graphql-tag.macro';

import StatTable from './stat-table';
import ValidationReport from '../validation-report';
// import StatHistogram from './stat-histogram';

import style from './style.module.scss';

const query = gql`
  fragment SequenceReadsHistogramQuery on SequenceReadsAnalysis {
    histogram(
      binTicks: [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2]
    ) {
      usualSites { percentStart, percentStop, count }
      drmSites { percentStart, percentStop, count }
      unusualSites { percentStart, percentStop, count }
      unusualApobecSites { percentStart, percentStop, count }
      apobecSites { percentStart, percentStop, count }
      apobecDrmSites { percentStart, percentStop, count }
      stopCodonSites { percentStart, percentStop, count }
      numPositions
    }
  }
`;
export {query};

export default class MutationStats extends React.Component {

  render() {
    const {
      histogram, minPrevalence: curCutoff,
      location, validationResults
    } = this.props;
    return (
      <section className={style.reportMutationStats}>
        <h2>
          Multi-threshold mutation summary table
        </h2>
        <div className={style.reportMutationStatsInner}>
          <StatTable
           {...histogram}
           currentCutoff={curCutoff}
           location={location} />
          <ValidationReport
           {...{validationResults}}
           placeholder={
             "No validation issue was found for the sequence reads."
           } />
        </div>
      </section>
    );
  }

}
