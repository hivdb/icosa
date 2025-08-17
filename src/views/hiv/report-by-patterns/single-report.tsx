import React from 'react';
import type { ObservePayload } from '../../../utils/use-scroll-observer';

import {
  ReportHeader,
  ValidationReport,
  MutationViewer as MutViewer,
  DRInterpretation,
  DRMutationScores,
  SeqMutationPrevalence,
  AlgComparison
} from '../../../components/report';

import useDisabledDrugs from '../use-disabled-drugs';
import style from '../style.module.scss';

interface SinglePatternReportProps {
  name?: string;
  currentSelected?: any;
  patternResult?: any;
  subtypeStats?: any[];
  output: string;
  index: number;
  config: {
    displayDRInterpretation?: boolean;
    displayMutationPrevalence?: boolean;
    displayAlgComparison?: boolean;
    displayMutationScores?: string[];
  };
    onObserve: (payload: ObservePayload) => void;
    onDisconnect?: (payload: ObservePayload) => void;
}

/**
 * Render a single pattern analysis report card.
 */
function SinglePatternReport({
  patternResult,
  subtypeStats,
  config: {
    displayDRInterpretation = true,
    displayMutationPrevalence = false,
    displayAlgComparison = false,
    displayMutationScores = []
  },
  output,
  name,
  index,
  onObserve,
  onDisconnect
}: SinglePatternReportProps) {
  const {
    strain: {name: strain} = {},
    allGeneMutations,
    validationResults,
    drugResistance
  } = patternResult || {};

    const isCritical =
      !!validationResults &&
      validationResults.some(({ level }: { level: string }) => level === 'CRITICAL');

  const disabledDrugs = useDisabledDrugs();

  return (
    <article
     key={name}
     data-loaded={!!patternResult}
     className={style['pattern-article']}>
        <ReportHeader
         output={output}
         name={name || ''}
         index={index}
         onObserve={onObserve}
         onDisconnect={onDisconnect} />
      {patternResult ? <>
        <MutViewer
         title="Mutation quality assessment"
         viewCheckboxLabel="Collapse genes"
         noUnseqRegions
         allGeneSeqs={allGeneMutations}
         strain={strain}
         defaultView="expansion"
         output={output}>
          <ValidationReport
           placeholder="There are no known mutation quality issues."
           {...patternResult}
           {...{output, strain}} />
        </MutViewer>
          {isCritical || !displayDRInterpretation ? null :
            drugResistance.map((geneDR: any, idx: number) => <React.Fragment key={idx}>
              <DRInterpretation
               {...{geneDR, output, disabledDrugs, strain}} />
              {displayMutationScores.includes(geneDR.gene.name) ?
                <DRMutationScores
                 {...{geneDR, output, disabledDrugs, strain}} /> : null}
            </React.Fragment>)}
        {!displayMutationPrevalence ? null :
        <SeqMutationPrevalence
         subtypeStats={subtypeStats}
         {...patternResult} />}
        {!displayAlgComparison ? null :
        <AlgComparison {...patternResult} />}
      </> : null}
    </article>
  );
}

export default SinglePatternReport;
