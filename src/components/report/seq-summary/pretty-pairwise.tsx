import React from 'react';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';

import Button from '../../button';
import style from './style.module.scss';
import parentStyle from '../style.module.scss';

import SinglePrettyPairwise, {
  PrettyPairwiseData
} from '../pretty-pairwise';

/** Properties for {@link PrettyPairwiseButton}. */
export interface PrettyPairwiseButtonProps {
  /** Whether the toggle button should be disabled. */
  disablePrettyPairwise: boolean;
  /** If true, the pretty pairwise section is currently shown. */
  showPrettyPairwise?: boolean;
  /** Callback invoked to toggle the pretty pairwise section. */
  togglePrettyPairwise?: () => void;
}

/**
 * Render a button that toggles visibility of the pretty pairwise section.
 *
 * @param props - {@link PrettyPairwiseButtonProps} configuration.
 * @returns Button element that toggles the pretty pairwise display.
 */
function PrettyPairwiseButton({
  disablePrettyPairwise,
  showPrettyPairwise,
  togglePrettyPairwise
}: PrettyPairwiseButtonProps) {

  return <Button
   className={parentStyle.button}
   onClick={togglePrettyPairwise}
   disabled={disablePrettyPairwise}>
    {showPrettyPairwise ?
      <FaEyeSlash className={parentStyle['icon-before-text']} /> :
      <FaEye className={parentStyle['icon-before-text']} />} Pretty pairwise
  </Button>;
}

/** Properties for {@link PrettyPairwiseList}. */
export interface PrettyPairwiseListProps {
  /** Genes and their associated pairwise alignment data. */
  geneSeqs: Array<{
    gene: {name: string};
    prettyPairwise: PrettyPairwiseData;
  }>;
}

/**
 * Render a list of pretty pairwise alignments for multiple genes.
 *
 * @param props - {@link PrettyPairwiseListProps} containing gene sequences.
 * @returns Container with formatted alignments for each gene.
 */
function PrettyPairwiseList({geneSeqs}: PrettyPairwiseListProps) {

  return <div className={style['pretty-pairwise']}>
    {geneSeqs.map(
      ({gene: {name: gene}, prettyPairwise}, idx) => (
        <SinglePrettyPairwise key={idx} {...{gene, prettyPairwise}} />
      )
    )}
  </div>;
}

export {PrettyPairwiseButton, PrettyPairwiseList};
