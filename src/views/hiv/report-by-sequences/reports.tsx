import React from 'react';

import { useReportPaginator } from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SingleSequenceReport from './single-report';

const pageTitlePrefix = 'Sequence Analysis Report';

function getPageTitle(sequenceAnalysis: any[], output: string): string {
  let pageTitle;
  if (output === 'printable' || sequenceAnalysis.length === 0) {
    pageTitle = `${pageTitlePrefix} Printable Version`;
  }
  else {
    const [{ inputSequence: { header } }] = sequenceAnalysis;
    pageTitle = `${pageTitlePrefix}: ${header}`;
  }
  return pageTitle;
}

interface SequenceReportsProps {
  config: any;
  output: string;
  match: any;
  loaded: boolean;
  sequences: any[];
  currentSelected?: any;
  sequenceAnalysis: any[];
  mutationPrevalenceSubtypes?: any[];
  fetchAnother: () => void;
  extVariables: { includeGenes: string[] };
}

/**
 * Render a paginated list of sequence analysis reports.
 */
function SequenceReports({
  config,
  output,
  match,
  loaded,
  sequences,
  currentSelected,
  sequenceAnalysis,
  mutationPrevalenceSubtypes,
  fetchAnother,
  extVariables: { includeGenes }
}: SequenceReportsProps) {
  const { onObserve, onDisconnect, paginator } = useReportPaginator({
    inputObjs: sequences,
    loaded,
    output,
    currentSelected,
    fetchAnother
  });

  const pageTitle = getPageTitle(sequenceAnalysis, output);
  setTitle(pageTitle);

  const seqResultLookup = sequenceAnalysis.reduce(
    (acc: Record<string, any>, sr: any) => {
      acc[sr.inputSequence.header] = sr;
      return acc;
    },
    {}
  );

  return (
    <>
      {output === 'printable' ? (
        <PrintHeader curAnalysis="sequence-analysis" />
      ) : (
        paginator
      )}
      <main className={style.main} data-loaded={loaded}>
        {sequences.map(({ header }, idx) => (
          <React.Fragment key={idx}>
            <SingleSequenceReport
              key={idx}
              includeGenes={includeGenes}
              currentSelected={currentSelected}
              sequenceResult={seqResultLookup[header]}
              subtypeStats={mutationPrevalenceSubtypes}
              onObserve={onObserve}
              onDisconnect={onDisconnect}
              config={config}
              output={output}
              header={header}
              index={idx}
              match={match}
            />
            {idx + 1 < sequenceAnalysis.length ? <PageBreak /> : null}
          </React.Fragment>
        ))}
      </main>
    </>
  );
}

export default SequenceReports;
