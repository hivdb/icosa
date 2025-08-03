import React from 'react';
import { DocumentNode } from 'graphql';

import SeqReadsAnalysisQuery from './query';
import { calcInitOffsetLimit } from '../cumu-query';
import { SequenceReads } from './types';

/** Context providing all sequence reads to children components. */
const SeqReadsContext = React.createContext<{ allSequenceReads?: SequenceReads[] }>({});

/**
 * Properties for {@link SeqReadsAnalysisContainer}.
 */
export interface SeqReadsAnalysisContainerProps {
  /** GraphQL fragment describing the analysis query. */
  query: DocumentNode;
  /** Additional GraphQL query parameters. */
  extraParams?: string;
  /** All sequence reads to analyse. */
  allSequenceReads: SequenceReads[];
  /** Currently selected sequence information. */
  currentSelected: { index: number; name: string };
  /** Apollo client instance. */
  client: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Text callback for progress bar. */
  progressText?: (progress: number, total: number) => string;
  /** Extend variables before query. */
  onExtendVariables?: (vars: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Whether to lazy load results. */
  lazyLoad: boolean;
  /** Render partial results while loading. */
  renderPartialResults?: boolean;
  /** Maximum items per request. */
  maxPerRequest?: number;
  /** Number of items to load quickly on initial render. */
  quickLoadLimit?: number;
  /** Render prop for child elements. */
  children: (args: any) => React.ReactNode; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface SeqReadsAnalysisContainerComponent
  extends React.FC<SeqReadsAnalysisContainerProps> {
  SequenceReadsConsumer: typeof SeqReadsContext.Consumer;
}

/**
 * Container component providing context and pagination for sequence reads
 * analysis queries.
 *
 * @param props - {@link SeqReadsAnalysisContainerProps} for the component.
 * @returns React element wrapping {@link SeqReadsAnalysisQuery}.
 */
const SeqReadsAnalysisContainer: SeqReadsAnalysisContainerComponent = ({
  progressText = (progress, total) =>
    `Running sequence reads analysis... (${progress}/${total})`,
  onExtendVariables = (vars) => vars,
  renderPartialResults = true,
  quickLoadLimit = 2,
  ...props
}: SeqReadsAnalysisContainerProps) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('render SeqReadsAnalysisContainer', new Date().getTime());
  }

  const {
    query,
    allSequenceReads,
    currentSelected,
    extraParams,
    client,
    lazyLoad,
    maxPerRequest,
    children,
  } = props;

  return (
    <SeqReadsContext.Provider value={{ allSequenceReads }}>
      <SeqReadsAnalysisQuery
        query={query}
        lazyLoad={lazyLoad}
        currentSelected={currentSelected}
        showProgressBar={!renderPartialResults}
        extraParams={extraParams}
        client={client}
        progressText={progressText}
        onExtendVariables={onExtendVariables}
        renderPartialResults={renderPartialResults}
        allSequenceReads={allSequenceReads}
        maxPerRequest={maxPerRequest}
        {...calcInitOffsetLimit({
          size: allSequenceReads.length,
          curIndex: currentSelected.index,
          lazyLoad,
          quickLoadLimit,
        })}
      >
        {children}
      </SeqReadsAnalysisQuery>
    </SeqReadsContext.Provider>
  );
};

SeqReadsAnalysisContainer.SequenceReadsConsumer = SeqReadsContext.Consumer;

export default SeqReadsAnalysisContainer;
export { SeqReadsContext };

