import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {sanitizeMutations} from '../../utils/mutation';

import style from './style.module.scss';
import linkStyle from '../link/style.module.scss';


MutationsErrors.propTypes = {
  geneOnly: PropTypes.string,
  allErrors: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      errors: PropTypes.arrayOf(
        PropTypes.string.isRequired
      ).isRequired
    }).isRequired
  ).isRequired,
  parentClassName: PropTypes.string,
  onAutoClean: PropTypes.func.isRequired
};

function MutationsErrors({geneOnly, allErrors, onAutoClean, parentClassName}) {

  const className = (
    parentClassName ? `${parentClassName}-errors` : null
  );

  return (
    <div
     data-display={allErrors.length > 0}
     className={classNames(
       style['mutations-errors'],
       className
     )}
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
             className={classNames(
               style['mutations-tagsinput-tag'],
               parentClassName ? `${parentClassName}-tagsinput-tag` : null
             )}>
              {geneOnly ? text.replace(/^[^:]+:/, '') : text}
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


export default function useMutationErrors({
  geneOnly,
  allowPositions,
  defaultGene,
  geneSynonyms,
  geneReferences,
  messages,
  parentClassName,
  mutations,
  onChange,
  onPreventSubmit
}) {

  const [, allErrors] = React.useMemo(
    () => sanitizeMutations(mutations, {
      allowPositions,
      defaultGene: geneOnly || defaultGene,
      geneSynonyms,
      geneReferences,
      messages
    }),
    [
      allowPositions,
      defaultGene,
      geneOnly,
      geneReferences,
      geneSynonyms,
      messages,
      mutations
    ]
  );

  React.useEffect(
    () => {
      if (allErrors.length > 0) {
        onPreventSubmit();
      }
    },
    [/* eslint-disable-line react-hooks/exhaustive-deps */]
  );

  const handleRemoveAllErrors = React.useCallback(
    e => {
      e.preventDefault();
      const [sanitized] = sanitizeMutations(mutations, {
        allowPositions,
        defaultGene: geneOnly || defaultGene,
        geneSynonyms,
        geneReferences,
        removeErrors: true
      });
      onChange(sanitized);
    },
    [
      defaultGene,
      allowPositions,
      geneOnly,
      geneReferences,
      geneSynonyms,
      mutations,
      onChange
    ]
  );

  return (
    <MutationsErrors
     geneOnly={geneOnly}
     allErrors={allErrors}
     parentClassName={parentClassName}
     onAutoClean={handleRemoveAllErrors} />
  );
}
