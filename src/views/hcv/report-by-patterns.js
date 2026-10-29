import React from 'react';
import PropTypes from 'prop-types';
import {matchShape, routerShape} from 'found';

import ConfigContext from '../../utils/config-context';
import PatternLoader from '../../components/pattern-loader';
import PatternAnalysisLayout from '../../components/pattern-analysis-layout';
import {
  ReportHeader,
  ReportSection,
  MutationViewer,
  ValidationReport,
  RefContextWrapper,
  useReportPaginator
} from
  '../../components/report';
import PageBreak from '../../components/page-break';
import setTitle from '../../utils/set-title';
import useApolloClient from '../hbv/apollo-client';
import PrintHeader from '../hbv/print-header';
import query from './pattern-query.graphql';
import {GeneMutations, ResistanceSummary} from './report-sections';
import {classifyGeneMutations} from './drm';
import {allGenes} from './region-presets';
import style from '../hbv/style.module.scss';

function PatternResults({
  patterns, patternAnalysis, currentSelected, loaded, fetchAnother, output
}) {
  setTitle('HCV Mutations Analysis Report');
  const {onObserve, onDisconnect, paginator} = useReportPaginator({
    inputObjs: patterns,
    loaded,
    output,
    currentSelected,
    fetchAnother
  });
  const byName = Object.fromEntries(
    patternAnalysis.map(result => [result.name, result])
  );
  return <>
    {output === 'printable' ?
      <PrintHeader curAnalysis="pattern-analysis" /> : paginator}
    <main className={style.main} data-loaded={loaded}>
      {patterns.map(({name}, idx) => {
        const result = byName[name];
        const geneMutations = classifyGeneMutations(
          result?.allGeneMutations || []
        );
        const resistanceGenes = geneMutations.filter(
          ({gene}) => allGenes.includes(gene.name)
        );
        const otherGenes = geneMutations.filter(
          ({gene}) => !allGenes.includes(gene.name)
        );
        const isCritical = result?.validationResults?.some(
          ({level}) => level === 'CRITICAL'
        );
        return <React.Fragment key={idx}>
          <article
           data-loaded={!!result}
           className={style['pattern-article']}>
            <ReportHeader
             output={output}
             name={name}
             index={idx}
             onObserve={onObserve}
             onDisconnect={onDisconnect} />
            {result ? <RefContextWrapper>
              <MutationViewer
               title="Mutation map & quality assessment"
               noUnseqRegions
               strain="HCV1"
               allGeneSeqs={resistanceGenes}
               output={output}>
                <ValidationReport
                 validationResults={result.validationResults} />
              </MutationViewer>
              {!isCritical &&
                <ResistanceSummary geneSequences={resistanceGenes} />}
              {otherGenes.length > 0 ?
                <ReportSection title="Other gene mutations">
                  {otherGenes.map(({gene, mutations}) => (
                    <GeneMutations
                     key={gene.name}
                     geneName={gene.name}
                     mutations={mutations} />
                  ))}
                </ReportSection> : null}
            </RefContextWrapper> : null}
          </article>
          {idx + 1 < patterns.length ? <PageBreak /> : null}
        </React.Fragment>;
      })}
    </main>
  </>;
}

PatternResults.propTypes = {
  patterns: PropTypes.array.isRequired,
  patternAnalysis: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  loaded: PropTypes.bool.isRequired,
  fetchAnother: PropTypes.func.isRequired,
  output: PropTypes.string.isRequired
};

function AnalyzePatterns({config, patterns, currentSelected, output}) {
  const client = useApolloClient({config, payload: patterns});
  const lazyLoad = output !== 'printable';
  return <PatternAnalysisLayout
   query={query}
   client={client}
   patterns={patterns}
   currentSelected={currentSelected}
   renderPartialResults={lazyLoad}
   lazyLoad={lazyLoad}>
    {props => <PatternResults {...props} output={output} />}
  </PatternAnalysisLayout>;
}

AnalyzePatterns.propTypes = {
  config: PropTypes.object.isRequired,
  patterns: PropTypes.array.isRequired,
  currentSelected: PropTypes.object,
  output: PropTypes.string.isRequired
};

export default function PatternReport({match, router}) {
  const {output = 'default'} = match.location.query || {};
  return <ConfigContext.Consumer>
    {config => <PatternLoader lazyLoad={output !== 'printable'}>
      {({patterns, currentSelected, isPending}) => {
        if (!isPending && patterns.length === 0) {
          router.replace({
            pathname: match.location.pathname.replace(/report\/?$/, '')
          });
          return null;
        }
        if (isPending) { return null; }
        return (
          <AnalyzePatterns
           config={config}
           patterns={patterns}
           currentSelected={currentSelected}
           output={output} />
        );
      }}
    </PatternLoader>}
  </ConfigContext.Consumer>;
}

PatternReport.propTypes = {
  match: matchShape.isRequired,
  router: routerShape.isRequired
};
