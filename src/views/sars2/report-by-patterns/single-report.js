import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import {
  MutationViewer as MutViewer,
  ReportHeader,
  ReportSection,
  MutationList as MutList,
  RefsSection,
  RefContextWrapper
} from '../../../components/report';

import SARS2MutComments from '../../../components/sars2-mutation-comments';
import AntibodySuscSummary from '../../../components/ab-susc-summary';
import CPSuscSummary from '../../../components/cp-susc-summary';
import VPSuscSummary from '../../../components/vp-susc-summary';

import style from '../style.module.scss';


function SinglePatternReport({
  antibodies,
  species,
  match,
  router,
  patternResult,
  output,
  index,
  onObserve,
  onDisconnect
}) {
  const {
    name,
    allGeneMutations
  } = patternResult;

  return (
    <article
     key={name}
     className={style['pattern-article']}>
      <RefContextWrapper>
        <ReportHeader
         output={output}
         name={name}
         index={index}
         onObserve={onObserve}
         onDisconnect={onDisconnect} />
        <ReportSection title="Sequence quality assessment">
          <MutViewer noUnseqRegions {...{
            allGeneSeqs: allGeneMutations,
            output
          }} />
        </ReportSection>
        <ReportSection title="Mutation list">
          <MutList {...patternResult} {...{output}} />
        </ReportSection>
        <ReportSection title="Mutation comments">
          <SARS2MutComments {...patternResult} />
        </ReportSection>
        <ReportSection title="MAb susceptibility summary">
          <AntibodySuscSummary
           antibodies={antibodies}
           {...patternResult} {...{output}} />
        </ReportSection>
        <ReportSection title="Convalescent plasma susceptibility summary">
          <CPSuscSummary
           {...patternResult} {...{output}} />
        </ReportSection>
        <ReportSection
         title="Plasma from vaccinated persons susceptibility summary">
          <VPSuscSummary
           {...patternResult} {...{output}} />
        </ReportSection>
        <RefsSection />
      </RefContextWrapper>
    </article>
  );
}

SinglePatternReport.propTypes = {
  currentSelected: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  species: PropTypes.string,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  patternResult: PropTypes.object.isRequired,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  antibodies: PropTypes.array.isRequired,
  onObserve: PropTypes.func.isRequired
};

export default SinglePatternReport;
