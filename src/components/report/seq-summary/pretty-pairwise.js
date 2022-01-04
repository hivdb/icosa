import React from 'react';
import PropTypes from 'prop-types';
import {FaEye} from '@react-icons/all-files/fa/FaEye';
import {FaEyeSlash} from '@react-icons/all-files/fa/FaEyeSlash';

import Button from '../../button';
import style from './style.module.scss';
import parentStyle from '../style.module.scss';

import SinglePrettyPairwise from '../pretty-pairwise';


PrettyPairwiseButton.propTypes = {
  disablePrettyPairwise: PropTypes.bool.isRequired,
  showPrettyPairwise: PropTypes.bool,
  togglePrettyPairwise: PropTypes.func
};

function PrettyPairwiseButton({
  disablePrettyPairwise,
  showPrettyPairwise,
  togglePrettyPairwise
}) {

  return <Button
   className={parentStyle.button}
   onClick={togglePrettyPairwise}
   disabled={disablePrettyPairwise}>
    {showPrettyPairwise ?
      <FaEyeSlash className={parentStyle['icon-before-text']} /> :
      <FaEye className={parentStyle['icon-before-text']} />} Pretty pairwise
  </Button>;
}


PrettyPairwiseList.propTypes = {
  geneSeqs: PropTypes.arrayOf(
    PropTypes.shape({
      gene: PropTypes.shape({
        name: PropTypes.string.isRequired
      }).isRequired,
      prettyPairwise: SinglePrettyPairwise.propTypes.prettyPairwise
    }).isRequired
  ).isRequired
};

function PrettyPairwiseList({geneSeqs}) {

  return <div className={style['pretty-pairwise']}>
    {geneSeqs.map(
      ({gene: {name: gene}, prettyPairwise}, idx) => (
        <SinglePrettyPairwise key={idx} {...{gene, prettyPairwise}} />
      )
    )}
  </div>;
}

export {PrettyPairwiseButton, PrettyPairwiseList};
