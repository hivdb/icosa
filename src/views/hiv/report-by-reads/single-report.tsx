import React from 'react';

import {
  SeqSummary,
  MutationViewer as MutViewer,
  ValidationReport,
  ReportHeader,
  DRInterpretation,
  DRMutationScores,
  SeqMutationPrevalence,
  AlgComparison
} from '../../../components/report';

import useDisabledDrugs from '../use-disabled-drugs';
import style from '../style.module.scss';

function useCoverages({ allReads }: { allReads: any[] }) {
  return React.useMemo(
    () =>
      allReads.map(({ gene, position, totalReads }) => ({
        gene,
        position,
        coverage: totalReads
      })),
    [allReads]
  );
}

interface SingleSeqReadsReportProps {
  includeGenes: string[];
  inputSequenceReads: any;
  sequenceReadsResult?: any;
  subtypeStats?: any[];
  config: {
    displaySubtype?: boolean;
    displayDRInterpretation?: boolean;
    displayMutationPrevalence?: boolean;
    displayAlgComparison?: boolean;
    displayMutationScores?: string[];
  };
  output: string;
  name: string;
  index: number;
  onObserve: (el: Element | null, idx: number) => void;
  onDisconnect: (el: Element | null) => void;
}

/**
 * Render details for a single sequence reads analysis.
 */
function SingleSeqReadsReport({
  includeGenes,
  inputSequenceReads,
  sequenceReadsResult,
  subtypeStats,
  config: {
    displaySubtype = true,
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
}: SingleSeqReadsReportProps) {
  const {
    strain: { display: strain } = {},
    readDepthStats: { p95: coverageUpperLimit } = {},
    validationResults,
    drugResistance,
    allGeneSequenceReads
  } = sequenceReadsResult || {};

  const coverages = useCoverages(inputSequenceReads);
  const isCritical =
    !!validationResults && validationResults.some(({ level }: any) => level === 'CRITICAL');

  const disabledDrugs = useDisabledDrugs();

  return (
    <article data-loaded={!!sequenceReadsResult} className={style['seqreads-article']}>
      <ReportHeader
        output={output}
        name={name}
        index={index}
        onObserve={onObserve}
        onDisconnect={onDisconnect}
      />
      {sequenceReadsResult ? (
        <>
          <SeqSummary {...sequenceReadsResult} {...{ output, strain, includeGenes }}>
            <SeqSummary.DownloadConsensus />
            <SeqSummary.MultilineGeneRange />
            <SeqSummary.MedianReadDepth />
            {displaySubtype ? <SeqSummary.Subtype /> : null}
            <SeqSummary.MinPositionReads />
            <SeqSummary.MaxMixtureRate />
            <SeqSummary.MinPrevalence />
            <SeqSummary.ThresholdNomogram />
            <SeqSummary.SDRMs />
          </SeqSummary>
          <MutViewer
            title="Sequence quality assessment"
            coverageUpperLimit={Math.min(1000, Math.floor(coverageUpperLimit))}
            allGeneSeqs={allGeneSequenceReads}
            defaultView="expansion"
            coverages={coverages}
            output={output}
            strain={strain}
          >
            <ValidationReport
              placeholder="There are no known sequence quality issues."
              {...sequenceReadsResult}
              {...{ output, strain }}
            />
          </MutViewer>
          {isCritical || !displayDRInterpretation
            ? null
            : drugResistance.map((geneDR: any, idx: number) => (
                <React.Fragment key={idx}>
                  <DRInterpretation {...{ geneDR, output, disabledDrugs, strain }} />
                  {displayMutationScores.includes(geneDR.gene.name) ? (
                    <DRMutationScores {...{ geneDR, output, disabledDrugs, strain }} />
                  ) : null}
                </React.Fragment>
              ))}
          {!displayMutationPrevalence ? null : (
            <SeqMutationPrevalence
              subtypeStats={subtypeStats}
              {...sequenceReadsResult}
            />
          )}
          {!displayAlgComparison ? null : (
            <AlgComparison {...sequenceReadsResult} />
          )}
        </>
      ) : null}
    </article>
  );
}

export default React.memo(
  SingleSeqReadsReport,
  (
    {
      index: prevIndex,
      output: prevOutput,
      onObserve: prevOnObserve,
      inputSequenceReads: prevInputSeq,
      sequenceReadsResult: prevResult
    },
    {
      index: nextIndex,
      output: nextOutput,
      onObserve: nextOnObserve,
      inputSequenceReads: nextInputSeq,
      sequenceReadsResult: nextResult
    }
  ) =>
    prevIndex === nextIndex &&
    prevOutput === nextOutput &&
    prevOnObserve === nextOnObserve &&
    prevInputSeq === nextInputSeq &&
    prevResult === nextResult
);
