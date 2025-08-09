import React from 'react';
import { DocumentNode } from 'graphql';

import SeqAnalysisQuery from './query';
import { calcInitOffsetLimit } from '../cumu-query';

/**
 * Properties for {@link SequenceAnalysisContainer}.
 */
export interface SequenceAnalysisContainerProps {
  /** GraphQL fragment describing the analysis query. */
  query: DocumentNode;
  /** Additional GraphQL parameters. */
  extraParams?: string;
  /** List of sequences to analyse. */
  sequences: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Currently selected sequence info. */
  currentSelected: { index: number; name: string };
  /** Apollo client instance. */
  client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Progress text generator. */
  progressText?: (progress: number, total: number) => string;
  /** Extend variables before query. */
  onExtendVariables?: (vars: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Whether to lazy load results. */
  lazyLoad: boolean;
  /** Render partial results while loading. */
  renderPartialResults?: boolean;
  /** Maximum number per request. */
  maxPerRequest?: number;
  /** Number of items to load quickly. */
  quickLoadLimit?: number;
  /** Render prop receiving query results. */
  children: (args: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Container component for running sequence analysis queries with pagination.
 *
 * @param props - {@link SequenceAnalysisContainerProps} for the component.
 * @returns React element wrapping {@link SeqAnalysisQuery}.
 */
const SequenceAnalysisContainer: React.FC<SequenceAnalysisContainerProps> = ({
  progressText = (progress, total) =>
    `Running sequence analysis... (${progress}/${total})`,
  onExtendVariables = (vars) => vars,
  renderPartialResults = true,
  quickLoadLimit = 2,
  ...props
}: SequenceAnalysisContainerProps) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('render SequenceAnalysisContainer', new Date().getTime());
  }

  const {
    query,
    sequences,
    currentSelected,
    extraParams,
    client,
    lazyLoad,
    maxPerRequest,
    children,
  } = props;

    return (
      <SeqAnalysisQuery
        query={query}
        lazyLoad={lazyLoad}
        quickLoadLimit={quickLoadLimit}
        renderPartialResults={renderPartialResults}
        currentSelected={currentSelected}
        showProgressBar={!renderPartialResults}
        extraParams={extraParams}
        client={client}
        progressText={progressText}
        onExtendVariables={onExtendVariables}
        sequences={sequences}
        maxPerRequest={maxPerRequest}
        {...calcInitOffsetLimit({
          size: sequences.length,
          curIndex: currentSelected.index,
          lazyLoad,
          quickLoadLimit,
        })}
      >
        {children}
      </SeqAnalysisQuery>
    );
  };

export default SequenceAnalysisContainer;