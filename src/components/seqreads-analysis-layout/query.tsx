import React from 'react';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

import Loader from '../loader';
import SmoothProgressBar from '../smooth-progress-bar';
import {
  includeFragment,
  includeFragmentIfExist,
} from '../../utils/graphql-helper';
import useCumuQuery from '../cumu-query';
import { SequenceReads } from './types';

/**
 * Build the GraphQL query for sequence reads analysis.
 *
 * @param fragment - GraphQL fragment describing result fields.
 * @param extraParams - Additional GraphQL variables for the query.
 * @returns GraphQL {@link DocumentNode} object for the query.
 */
function getQuery(fragment: DocumentNode, extraParams?: string): DocumentNode {
  return gql`
    query SeqReadsAnalyses(
      $allSequenceReads: [SequenceReadsInput]!
      ${extraParams ? ', ' + extraParams : ''}
    ) {
      __typename
      currentVersion { text, publishDate }
      currentProgramVersion { text, publishDate }
      sequenceReadsAnalysis(sequenceReads: $allSequenceReads) {
        name
        ${includeFragment(fragment, 'SequenceReadsAnalysis')}
      }
      ${includeFragmentIfExist(fragment, 'Root')}
    }
    ${fragment}
  `;
}

/**
 * Props for {@link SeqReadsAnalysisQuery}.
 */
export interface SeqReadsAnalysisQueryProps {
  /** Currently selected sequence reads info. */
  currentSelected?: { index: number; name: string };
  /** GraphQL fragment defining the analysis. */
  query: DocumentNode;
  /** Whether to load data lazily. */
  lazyLoad: boolean;
  /** Render partial results while loading. */
  renderPartialResults: boolean;
  /** Additional GraphQL parameters. */
  extraParams?: string;
  /** All sequence reads to analyse. */
  allSequenceReads: SequenceReads[];
  /** Initial offset for pagination. */
  initOffset: number;
  /** Initial limit for pagination. */
  initLimit: number;
  /** Child render function receiving query results. */
  children: (args: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Apollo client instance. */
  client?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Progress bar text callback. */
  progressText: (progress: number, total: number) => string;
  /** Whether to display progress bar. */
  showProgressBar: boolean;
  /** Extend variables before query. */
  onExtendVariables: (vars: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Maximum number of items per request. */
  maxPerRequest?: number;
}

/**
 * Component running sequence reads analysis cumulatively and rendering results.
 *
 * @param props - {@link SeqReadsAnalysisQueryProps} for the component.
 * @returns React element with loader, progress bar and children output.
 */
export default function SeqReadsAnalysisQuery({
  renderPartialResults,
  currentSelected,
  query: queryFragment,
  lazyLoad,
  extraParams,
  allSequenceReads,
  initOffset,
  initLimit,
  children,
  client,
  progressText,
  showProgressBar,
  onExtendVariables,
  maxPerRequest = 1,
}: SeqReadsAnalysisQueryProps): JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('Render SeqReadsAnalysisQuery', new Date().getTime());
  }

  const onSeqReadsExtendVariables = React.useCallback(
    (vars: any) => {
      vars.allSequenceReads = vars.allSequenceReads.map(
        ({ allReads, ...seqReads }: any) => ({
          allReads: allReads.map(({ allCodonReads, ...read }: any) => ({
            allCodonReads: allCodonReads.map(({ codon, reads }: any) => ({
              codon,
              reads,
            })),
            ...read,
          })),
          ...seqReads,
        })
      );
      return onExtendVariables(vars);
    },
    [onExtendVariables]
  );

  const { loaded, error, data, extVariables, progressObj, fetchAnother } =
    useCumuQuery({
      query: getQuery(queryFragment, extraParams),
      lazyLoad,
      inputObjs: allSequenceReads,
      initOffset,
      initLimit,
      client,
      currentSelected,
      onExtendVariables: onSeqReadsExtendVariables,
      maxPerRequest,
      mainInputName: 'allSequenceReads',
      inputUniqKeyName: 'name',
      mainOutputName: 'sequenceReadsAnalysis',
      outputUniqKeyName: 'name',
    });

  if (error) {
    return `Error! ${error.message}` as unknown as JSX.Element;
  }

  let progressbar: React.ReactNode = null;
  let childNode: React.ReactNode = null;

  if (loaded || renderPartialResults) {
    const {
      currentVersion,
      currentProgramVersion,
      sequenceReadsAnalysis = [],
      ...dataMisc
    } = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    childNode = children({
      loaded,
      allSequenceReads,
      currentSelected,
      fetchAnother,
      currentVersion,
      currentProgramVersion,
      sequenceReadsAnalysis,
      ...dataMisc,
      extVariables,
    });
  }

  if (showProgressBar) {
    progressbar = (
      <SmoothProgressBar
        loaded={loaded}
        progressText={progressText}
        {...progressObj}
      />
    );
  }

  return (
    <>
      {(showProgressBar || loaded) ? null : <Loader modal />}
      {progressbar}
      {childNode}
    </>
  );
}

