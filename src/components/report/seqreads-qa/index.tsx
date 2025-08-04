import React from 'react';
import gql from 'graphql-tag.macro';

import ExtCodfish from './ext-codfish';
import style from './style.module.scss';

const query = gql`
  fragment ExtCodfish on SequenceReadsAnalysis {
    name
    allGeneSequenceReads {
      gene { name }
      internalJsonAllPositionCodonReads(
        mutationOnly: true,
        maxProportion: 1,
        minProportion: 0.002
      )
    }
  }
`;

export interface SeqReadsQAProps {
  /** Sequence name displayed above the chart. */
  name: string;
  /** Gene sequence reads used to generate the graph. */
  allGeneSequenceReads: any[];
  /** Optional output mode (e.g. printable). */
  output?: string;
}

/**
 * SeqReadsQA renders the low-abundance mutations section of the report.
 * It embeds an {@link ExtCodfish} chart to visualize rare mutations.
 *
 * @param props - {@link SeqReadsQAProps}
 * @returns React element containing the low abundance mutation section.
 */
export default function SeqReadsQA({
  output,
  name,
  allGeneSequenceReads
}: SeqReadsQAProps) {
  return (
    <section className={style['report-seqreads-qa']}>
      <h2>Low abundance mutations</h2>
      <ExtCodfish {...{output, name, allGeneSequenceReads}} />
    </section>
  );
}

export {query};

