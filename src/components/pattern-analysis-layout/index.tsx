import React from 'react';
import { DocumentNode } from 'graphql';

import PatAnalysisQuery from './query';
import { calcInitOffsetLimit } from '../cumu-query';

/**
 * Properties for {@link PatternAnalysisContainer}.
 */
export interface PatternAnalysisContainerProps {
  /** GraphQL fragment describing the analysis query. */
  query: DocumentNode;
  /** Additional GraphQL query parameters. */
  extraParams?: string;
  /**
   * List of mutation patterns to analyse. Each pattern contains a name and a
   * list of mutations. Only the array length is used by this component.
   */
  patterns: Array<{ name: string; mutations: string[] }>;
  /** Currently selected pattern information. */
  currentSelected: { index: number; name: string };
  /** Apollo client instance used for queries. */
  client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * Callback used to render progress text. Receives current progress and total
   * number of patterns and should return a descriptive string.
   */
  progressText?: (progress: number, total: number) => string;
  /** Function to extend variables before sending to server. */
  onExtendVariables?: (vars: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Whether queries should load data lazily. */
  lazyLoad: boolean;
  /** Whether partial results should be rendered while loading. */
  renderPartialResults?: boolean;
  /** Child render function receiving query results. */
  children: (args: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Container component that prepares pagination parameters for
 * {@link PatAnalysisQuery} and forwards all props.
 *
 * @param props - {@link PatternAnalysisContainerProps} for the component.
 * @returns React element that executes the pattern analysis query.
 */
export default function PatternAnalysisContainer({
  progressText = (progress, total) =>
    `Running pattern analysis... (${progress}/${total})`,
  onExtendVariables = (vars) => vars,
  renderPartialResults = true,
  ...props
}: PatternAnalysisContainerProps): React.ReactElement {
  const { currentSelected, patterns, lazyLoad } = props;

  return (
    <PatAnalysisQuery
      {...props}
      progressText={progressText}
      onExtendVariables={onExtendVariables}
      renderPartialResults={renderPartialResults}
      {...calcInitOffsetLimit({
        size: patterns.length,
        curIndex: currentSelected.index,
        lazyLoad,
      })}
    />
  );
}

