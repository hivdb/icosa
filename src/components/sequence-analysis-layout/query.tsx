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

/**
 * Build the GraphQL query for sequence analyses.
 *
 * @param fragment - GraphQL fragment containing fields for the analysis.
 * @param extraParams - Extra parameters to append to the query.
 * @returns GraphQL {@link DocumentNode} for the request.
 */
function getQuery(fragment: DocumentNode, extraParams?: string): DocumentNode {
  return gql`
    query SequenceAnalyses(
      $sequences: [UnalignedSequenceInput]!
      ${extraParams ? ', ' + extraParams : ''}
    ) {
      __typename
      currentVersion { text, publishDate }
      currentProgramVersion { text, publishDate }
      sequenceAnalysis(sequences: $sequences) {
        inputSequence { header }
        ${includeFragment(fragment, 'SequenceAnalysis')}
      }
      ${includeFragmentIfExist(fragment, 'Root')}
    }
    ${fragment}
  `;
}

/**
 * Props for {@link SequenceAnalysisQuery}.
 */
export interface SequenceAnalysisQueryProps {
  /** Whether to load sequences lazily. */
  lazyLoad: boolean;
  /** Number of items to preload quickly. */
  quickLoadLimit: number;
  /** Render partial results while loading. */
  renderPartialResults: boolean;
  /** Currently selected sequence info. */
  currentSelected?: { index: number; name: string };
  /** GraphQL fragment describing analysis. */
  query: DocumentNode;
  /** Additional GraphQL parameters. */
  extraParams?: string;
  /** Input sequences for analysis. */
  sequences: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Initial offset for pagination. */
  initOffset: number;
  /** Initial limit for pagination. */
  initLimit: number;
  /** Child render function. */
  children: (args: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Apollo client instance. */
  client?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Progress text callback. */
  progressText: (progress: number, total: number) => string;
  /** Whether to display progress bar. */
  showProgressBar: boolean;
  /** Extend variables before request. */
  onExtendVariables: (vars: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Maximum items per request. */
  maxPerRequest?: number;
}

/**
 * Execute the sequence analysis query cumulatively and render results.
 *
 * @param props - {@link SequenceAnalysisQueryProps} for the component.
 * @returns React element containing loader, progress bar and rendered children.
 */
export default function SequenceAnalysisQuery({
  lazyLoad,
  quickLoadLimit,
  renderPartialResults,
  currentSelected,
  query: queryFragment,
  extraParams,
  sequences,
  initOffset,
  initLimit,
  children,
  client,
  progressText,
  showProgressBar,
  onExtendVariables,
  maxPerRequest = 1,
}: SequenceAnalysisQueryProps): JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('Render SequenceAnalysisQuery', new Date().getTime());
  }

  const { loaded, error, data, extVariables, progressObj, fetchAnother } =
    useCumuQuery({
      query: getQuery(queryFragment, extraParams),
      lazyLoad,
      quickLoadLimit,
      inputObjs: sequences,
      initOffset,
      initLimit,
      client,
      currentSelected,
      onExtendVariables,
      maxPerRequest,
      mainInputName: 'sequences',
      inputUniqKeyName: 'header',
      mainOutputName: 'sequenceAnalysis',
      outputUniqKeyName: 'inputSequence.header',
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
      sequenceAnalysis = [],
      ...dataMisc
    } = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    childNode = children({
      loaded,
      sequences,
      currentSelected,
      fetchAnother,
      currentVersion,
      currentProgramVersion,
      sequenceAnalysis,
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

