import React from 'react';
import {matchShape, routerShape} from 'found';
import gql from 'graphql-tag';

import StatTable from './stat-table';
import ValidationReport from '../validation-report';
// import StatHistogram from './stat-histogram';
import config from '../../../config';

import style from './style.module.scss';

const query = gql`
  fragment SequenceReadsHistogramQuery on SequenceReadsAnalysis {
    histogram(
      binTicks: [0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5]
    ) {
      numPositions
    ${config.mutStatTableColumns.filter(({query}) => !!query)
    .map(({name, query}) => (
      `${name}: ${query} { percentStart, percentStop, count }`
    )).join('\n')}
    }
  }
`;
export {query};

export default class MutationStats extends React.Component {

  static propTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired
  }

  render() {
    const {
      histogram, minPrevalence: curCutoff,
      match, router, validationResults
    } = this.props;
    return (
      <section className={style['report-mutation-stats']}>
        <h2>
          Multi-threshold mutation summary table
        </h2>
        <div className={style['report-mutation-stats-inner']}>
          <StatTable
           {...histogram}
           {...{match, router}}
           currentCutoff={curCutoff} />
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
