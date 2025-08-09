import React from 'react';
import {useReportPaginator} from '../../../components/report';
import PageBreak from '../../../components/page-break';

import setTitle from '../../../utils/set-title';

import style from '../style.module.scss';
import PrintHeader from '../print-header';
import SingleSequenceReport from './single-report';

const pageTitlePrefix = 'Sequence Analysis Report';

function getPageTitle(sequenceAnalysis: any[], output: string): string {
  let pageTitle;
  if (
    output === 'printable' ||
    sequenceAnalysis.length === 0
  ) {
    pageTitle = `${pageTitlePrefix} Printable Version`;
  }
  else {
    const [{inputSequence: {header}}] = sequenceAnalysis;
    pageTitle = `${pageTitlePrefix}: ${header}`;
  }
  return pageTitle;
}

interface SequenceReportsProps {
  cmtVersion?: string;
  drdbLastUpdate?: string;
  output: string;
  match: any;
  loaded: boolean;
  sequences: any[];
  currentSelected?: any;
  antibodies?: any[];
  sequenceAnalysis: any[];
  fetchAnother: (name: string, updateCurrentSelected: boolean) => Promise<void>;
}

/**
 * Render sequence analysis reports with pagination.
 */
const SequenceReports: React.FC<SequenceReportsProps> = ({
  output,
  antibodies = [],
  cmtVersion,
  drdbLastUpdate,
  match,
  loaded,
  sequences,
  currentSelected,
  sequenceAnalysis,
  fetchAnother
}: SequenceReportsProps) => {

  const {
    onObserve,
    onDisconnect,
    paginator
  } = useReportPaginator({
    inputObjs: sequences,
    loaded,
    output,
    currentSelected,
    fetchAnother
  });

  const pageTitle = getPageTitle(sequenceAnalysis, output);
  setTitle(pageTitle);

  const seqResultLookup = sequenceAnalysis.reduce(
    (acc: any, sr: any) => {
      acc[sr.inputSequence.header] = sr;
      return acc;
    },
    {}
  );

  return <>
    {output === 'printable' ?
      <PrintHeader curAnalysis="sequence-analysis" /> :
      paginator
    }
    <main className={style.main} data-loaded={loaded}>
      {sequences.map(({header}, idx) => (
        <React.Fragment key={idx}>
          <SingleSequenceReport
           key={idx}
           antibodies={antibodies}
           cmtVersion={cmtVersion}
           drdbLastUpdate={drdbLastUpdate}
           currentSelected={currentSelected}
           sequenceResult={seqResultLookup[header]}
           onObserve={onObserve}
           onDisconnect={onDisconnect}
           output={output}
           header={header}
           index={idx}
           match={match} />
          {idx + 1 < sequenceAnalysis.length ?
            <PageBreak /> : null}
        </React.Fragment>
      ))}
    </main>
  </>;
};

export default SequenceReports;

