import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';
import linkStyle from '../../link/style.module.scss';


function MutationsErrors({allErrors, onAutoClean}) {
  return (
    <div
     data-display={allErrors.length > 0}
     className={style['mutations-errors']}
     style={{
       '--error-rows': allErrors.reduce(
         (acc, {errors}) => acc + errors.length + 1,
         0
       )
     }}>
      <p>
        Please fix following errors: (
        <a
         className={linkStyle.link}
         onClick={onAutoClean}
         href="#remove-all">
          remove all problematic mutations
        </a>
        )
      </p>
      <ul>
        {allErrors.map(({text, errors}, idx) => (
          <li key={idx}>
            <span
             data-error="true"
             className={style['mutations-tagsinput-tag']}>
              {text}
            </span>:
            <ul>
              {errors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

MutationsErrors.propTypes = {
  allErrors: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      errors: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired
    }).isRequired
  ).isRequired,
  onAutoClean: PropTypes.func.isRequired
};

export default MutationsErrors;
