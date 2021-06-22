import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {
  MutationViewer as MutViewer,
  ReportHeader,
  ReportSection,
  MutationList as MutList,
  RefContextWrapper
} from '../../../components/report';

import style from '../style.module.scss';


function SinglePatternReport({
  match,
  router,
  patternResult,
  output,
  name,
  index,
  onObserve,
  onDisconnect
}) {
  const {
    allGeneMutations
  } = patternResult || {};

  return (
    <article
     key={name}
     data-loaded={!!patternResult}
     className={style['pattern-article']}>
      <ReportHeader
       output={output}
       name={name}
       index={index}
       onObserve={onObserve}
       onDisconnect={onDisconnect} />
      {patternResult ? <>
        <RefContextWrapper>
          <ReportSection title="Sequence quality assessment">
            <MutViewer noUnseqRegions {...{
              allGeneSeqs: allGeneMutations,
              output
            }} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           title="Mutation list">
            <MutList {...patternResult} {...{output}} />
          </ReportSection>
        </RefContextWrapper>
      </> : null}
    </article>
  );
}

SinglePatternReport.propTypes = {
  currentSelected: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  patternResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  onObserve: PropTypes.func.isRequired
};

export default SinglePatternReport;
