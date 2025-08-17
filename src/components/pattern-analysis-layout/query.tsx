import React from 'react';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

import Loader from '../loader';
import useCumuQuery from '../cumu-query';
import SmoothProgressBar from '../smooth-progress-bar';
import {
  includeFragment,
  includeFragmentIfExist,
} from '../../utils/graphql-helper';

const MAX_PER_REQUEST = 10;

/**
 * Build the GraphQL query for pattern analyses.
 *
 * @param fragment - GraphQL fragment containing the result fields.
 * @param extraParams - Additional GraphQL parameters to append.
 * @returns GraphQL {@link DocumentNode} representing the query.
 */
function getQuery(fragment: DocumentNode, extraParams?: string): DocumentNode {
  return gql`
    query patternAnalyses(
      $patterns: [[String!]!]!
      $patternNames: [String!]!
      ${extraParams ? ', ' + extraParams : ''}
    ) {
      __typename
      currentVersion { text, publishDate }
      currentProgramVersion { text, publishDate }
      patternAnalysis(patterns: $patterns, patternNames: $patternNames) {
        name
        ${includeFragment(fragment, 'MutationsAnalysis')}
      }
      ${includeFragmentIfExist(fragment, 'Root')}
    }
    ${fragment}
  `;
}

/**
 * Properties for {@link PatternAnalysisQuery}.
 */
export interface PatternAnalysisQueryProps {
  /** GraphQL fragment defining result selection. */
  query: DocumentNode;
  /** Additional GraphQL query parameters. */
  extraParams?: string;
  /** Patterns to analyse. */
  patterns: Array<{ name: string; mutations: string[] }>;
  /** Initial offset for lazy loading. */
  initOffset: number;
  /** Initial limit for lazy loading. */
  initLimit: number;
  /** Render prop called with query results. */
  children: (args: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Apollo client instance. */
  client?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Text to display for the progress bar. */
  progressText: (progress: number, total: number) => string;
  /** Whether to show the progress bar. */
  showProgressBar?: boolean;
  /** Function to extend variables before request. */
  onExtendVariables: (vars: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Whether to render partial results. */
  renderPartialResults?: boolean;
  /** Currently selected pattern. */
  currentSelected?: { index: number; name: string };
  /** Whether to fetch lazily. */
  lazyLoad?: boolean;
}

/**
 * Execute pattern analysis queries cumulatively and render results using a
 * render prop.
 *
 * @param props - {@link PatternAnalysisQueryProps} for the component.
 * @returns React element showing loader, progress bar and results.
 */
export default function PatternAnalysisQuery({
  renderPartialResults,
  currentSelected,
  query: queryFragment,
  lazyLoad = false,
  extraParams,
  patterns,
  initOffset,
  initLimit,
  children,
  client,
  progressText,
  showProgressBar = false,
  onExtendVariables,
}: PatternAnalysisQueryProps): JSX.Element {
  const onPatternExtendVariables = React.useCallback(
    (vars: any) => {
      vars.patternNames = vars.patterns.map(({ name }: any) => name);
      vars.patterns = vars.patterns.map(({ mutations }: any) => mutations);
      return onExtendVariables(vars);
    },
    [onExtendVariables],
  );

  const { loaded, error, data, progressObj, fetchAnother } = useCumuQuery({
    query: getQuery(queryFragment, extraParams),
    lazyLoad,
    inputObjs: patterns,
    initOffset,
    initLimit,
    client,
    currentSelected: currentSelected ? { index: currentSelected.index } : { index: 0 },
    onExtendVariables: onPatternExtendVariables,
    maxPerRequest: MAX_PER_REQUEST,
    mainInputName: 'patterns',
    inputUniqKeyName: 'name',
    mainOutputName: 'patternAnalysis',
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
      patternAnalysis = [],
      ...dataMisc
    } = data as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    childNode = children({
      loaded,
      patterns,
      currentSelected,
      fetchAnother,
      currentVersion,
      currentProgramVersion,
      patternAnalysis,
      ...dataMisc,
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

