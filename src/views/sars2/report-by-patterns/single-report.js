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
import {
  AbSuscSummary,
  CPSuscSummary,
  VPSuscSummary
} from '../../../components/susc-summary';

import style from '../style.module.scss';


function SinglePatternReport({
  cmtVersion,
  drdbLastUpdate,
  antibodies,
  species,
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
          <ReportSection
           titleAnnotation={<>
             Last updated on {new Date(
               parseInt(cmtVersion.slice(0, 4)),
               parseInt(cmtVersion.slice(4, 6) - 1),
               parseInt(cmtVersion.slice(6, 8))
             ).toLocaleDateString("en-US")}
           </>}
           title="Mutation comments">
            <SARS2MutComments {...patternResult} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           titleAnnotation={<>
             Last updated on {new Date(drdbLastUpdate).toLocaleString("en-US")}
           </>}
           title="MAb susceptibility summary">
            <AbSuscSummary
             antibodies={antibodies}
             {...patternResult} {...{output}} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           titleAnnotation={<>
             Last updated on {new Date(drdbLastUpdate).toLocaleString("en-US")}
           </>}
           title="Convalescent plasma susceptibility summary">
            <CPSuscSummary
             {...patternResult} {...{output}} />
          </ReportSection>
          <ReportSection
           className={style['no-page-break']}
           titleAnnotation={<>
             Last updated on {new Date(drdbLastUpdate).toLocaleString("en-US")}
           </>}
           title="Plasma from vaccinated persons susceptibility summary">
            <VPSuscSummary
             {...patternResult} {...{output}} />
          </ReportSection>
          <RefsSection />
        </RefContextWrapper>
      </> : null}
    </article>
  );
}

SinglePatternReport.propTypes = {
  currentSelected: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  species: PropTypes.string,
  match: matchShape.isRequired,
  router: routerShape.isRequired,
  patternResult: PropTypes.object,
  output: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  antibodies: PropTypes.array.isRequired,
  onObserve: PropTypes.func.isRequired
};

export default SinglePatternReport;
