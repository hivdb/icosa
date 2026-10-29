import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import ConfigContext from '../../utils/config-context';
import SeqLoader, {useWhenNoSequence} from '../../components/sequence-loader';
import SequenceAnalysisLayout from '../../components/sequence-analysis-layout';
import {useReportPaginator} from '../../components/report';
import PageBreak from '../../components/page-break';
import setTitle from '../../utils/set-title';
import useApolloClient from './apollo-client';
import useExtendVariables from './use-extend-variables';
import PrintHeader from './print-header';
import SingleSequenceReport from './report-by-sequences/single-report';
import query from './sequence-query.graphql';
import {ResistanceSummary} from './report-sections';
import {classifyGeneMutations} from './drm';
import style from './style.module.scss';

function SequenceResults({
  sequences, sequenceAnalysis, currentSelected, loaded, fetchAnother, output
}) {
  setTitle('HCV Sequence Analysis Report');
  const {onObserve, onDisconnect, paginator} = useReportPaginator({
    inputObjs: sequences,
    loaded,
    output,
    currentSelected,
    fetchAnother
  });
  const byHeader = Object.fromEntries(
    sequenceAnalysis.map(result => [result.inputSequence.header, result])
  );
  return <>
    {output === 'printable' ?
      <PrintHeader curAnalysis="sequence-analysis" /> : paginator}
    <main className={style.main} data-loaded={loaded}>
      {sequences.map(({header}, idx) => {
        const result = byHeader[header];
        const alignedGeneSequences = classifyGeneMutations(
          result?.alignedGeneSequences || []
        );
        return <React.Fragment key={idx}>
          <SingleSequenceReport
           header={header}
           index={idx}
           output={output}
           sequenceResult={result ? {
             ...result,
             alignedGeneSequences,
             includeGenes: alignedGeneSequences.map(
               ({gene}) => gene.name
             )
           } : undefined}
           onObserve={onObserve}
           onDisconnect={onDisconnect}>
            {result && !result.validationResults?.some(
              ({level}) => level === 'CRITICAL'
            ) ? <ResistanceSummary
             geneSequences={alignedGeneSequences} /> : null}
          </SingleSequenceReport>
          {idx + 1 < sequenceAnalysis.length ? <PageBreak /> : null}
        </React.Fragment>;
      })}
    </main>
  </>;
}

SequenceResults.propTypes = {
  sequences: PropTypes.array.isRequired,
  sequenceAnalysis: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  loaded: PropTypes.bool.isRequired,
  fetchAnother: PropTypes.func.isRequired,
  output: PropTypes.string.isRequired
};

function AnalyzeSequences({config, sequences, currentSelected, output}) {
  const client = useApolloClient({config, payload: sequences});
  const onExtendVariables = useExtendVariables({config});
  const lazyLoad = output !== 'printable';
  return <SequenceAnalysisLayout
   query={query}
   client={client}
   sequences={sequences}
   currentSelected={currentSelected}
   renderPartialResults={lazyLoad}
   lazyLoad={lazyLoad}
   extraParams="$includeGenes: [EnumGene!]!"
   onExtendVariables={onExtendVariables}>
    {props => <SequenceResults {...props} output={output} />}
  </SequenceAnalysisLayout>;
}

AnalyzeSequences.propTypes = {
  config: PropTypes.object.isRequired,
  sequences: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  output: PropTypes.string.isRequired
};

export default function SequenceReport({match, router}) {
  useWhenNoSequence(() => router.replace({
    pathname: match.location.pathname.replace(/report\/?$/, '')
  }));
  const {output = 'default'} = match.location.query || {};
  return <ConfigContext.Consumer>
    {config => <SeqLoader lazyLoad={output !== 'printable'}>
      {({sequences, currentSelected}) => <AnalyzeSequences
       config={config}
       sequences={sequences}
       currentSelected={currentSelected}
       output={output} />}
    </SeqLoader>}
  </ConfigContext.Consumer>;
}

SequenceReport.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired
};
