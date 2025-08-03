import React from 'react';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';

import Button from '../../button';
import style from './style.module.scss';
import parentStyle from '../style.module.scss';

import SinglePrettyPairwise from '../pretty-pairwise';

/** Properties for {@link PrettyPairwiseButton}. */
export interface PrettyPairwiseButtonProps {
  disablePrettyPairwise: boolean;
  showPrettyPairwise?: boolean;
  togglePrettyPairwise?: () => void;
}

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
  geneSeqs: Array<{
    gene: {name: string};
    prettyPairwise: any; // structure defined by SinglePrettyPairwise
  }>;
}

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
