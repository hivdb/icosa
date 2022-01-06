import React from 'react';
import PropTypes from 'prop-types';
import {FaAngleDoubleRight} from '@react-icons/all-files/fa/FaAngleDoubleRight';

import style from './style.module.scss';


PrettyPairwise.propTypes = {
  gene: PropTypes.string.isRequired,
  prettyPairwise: PropTypes.shape({
    positionLine: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    refAALine: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    alignedNAsLine: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired,
    mutationLine: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  })
};

export default function PrettyPairwise({
  gene,
  prettyPairwise: {
    positionLine,
    refAALine,
    alignedNAsLine,
    mutationLine
  }
}) {

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
