import React from 'react';
import {FaAngleDoubleRight} from '@react-icons/all-files/fa/FaAngleDoubleRight';

import style from './style.module.scss';

/**
 * Alignment lines that make up a pretty pairwise display.
 */
export interface PrettyPairwiseData {
  /** Positions along the reference sequence. */
  positionLine: string[];
  /** Amino acids from the reference sequence. */
  refAALine: string[];
  /** Aligned nucleic acids from the query sequence. */
  alignedNAsLine: string[];
  /** Mutation indicators relative to the reference. */
  mutationLine: string[];
}

/** Properties for {@link PrettyPairwise}. */
export interface PrettyPairwiseProps {
  /** Name of the gene being rendered. */
  gene: string;
  /** Alignment information for the gene. */
  prettyPairwise: PrettyPairwiseData;
}

/**
 * Render a human-readable pairwise alignment for a specific gene.
 *
 * @param props - {@link PrettyPairwiseProps} containing gene name and
 *   alignment lines.
 * @returns Header and preformatted alignment lines.
 */
export default function PrettyPairwise({
  gene,
  prettyPairwise: {
    positionLine,
    refAALine,
    alignedNAsLine,
    mutationLine
  }
}: PrettyPairwiseProps) {

  return [
    <header key={0}>
      <h3>Pretty pairwise of {gene}:</h3>
      <span className={style.instruction}>
        Scroll right for more <FaAngleDoubleRight />
      </span>
    </header>,
    <pre key={1}>
      <div>
        {positionLine.map((t, idx) => <span key={idx}>{t}</span>)}
      </div>
      <div>
        {refAALine.map((t, idx) => <span key={idx}>{t}</span>)}
      </div>
      <div>
        {alignedNAsLine.map((t, idx) => <span key={idx}>{t}</span>)}
      </div>
      <div>
        {mutationLine.map((t, idx) => <span key={idx}>{t}</span>)}
      </div>
    </pre>
  ];
}
