import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TagsInput from 'react-tagsinput';

import {
  parseMutation,
  sanitizeMutations,
  parseAndValidateMutation
} from '../../utils/mutation';

import useMutationsErrors from './mutations-errors';
import style from './style.module.scss';


MutationsTagsInput.propTypes = {
  config: PropTypes.shape({
    allowPositions: PropTypes.bool,
    mutationDefaultGene: PropTypes.string,
    geneSynonyms: PropTypes.objectOf(
      PropTypes.string.isRequired
    ),
    geneReferences: PropTypes.object.isRequired,
    messages: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired
  }),
  geneOnly: PropTypes.string,
  mutations: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  parentClassName: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default function MutationsTagsInput({
  config,
  geneOnly,
  mutations,
  onChange,
  parentClassName
}) {
  const {
    allowPositions = false,
    mutationDefaultGene,
    geneSynonyms,
    geneReferences,
    messages
  } = config;

  const placeholder = (
    messages['pattern-analysis-input-placeholder'] ||
    '<pattern-analysis-input-placeholder>'
  );

  const className = (
    parentClassName ? `${parentClassName}-tagsinput` : null
  );

  const [filteredMutations, otherMutations] = React.useMemo(
    () => {
      if (!geneOnly) {
        return [mutations, []];
      }
      const mutObjs = mutations.map(parseMutation);
      return [
        mutations.filter((_, idx) => mutObjs[idx][3] === geneOnly),
        mutations.filter((_, idx) => mutObjs[idx][3] !== geneOnly)
      ];
    },
    [geneOnly, mutations]
  );

  const handlePreventSubmit = React.useCallback(
    () => onChange({mutations}, true),
    [onChange, mutations]
  );

  const handleChange = React.useCallback(
    filteredMutations => {
      let resultMutations;
      if (geneOnly) {
        resultMutations = [
          ...filteredMutations.map(
            mut => mut.includes(':') ? mut : `${geneOnly}:${mut}`
          ),
          ...otherMutations
        ];
      }
      else {
        resultMutations = filteredMutations;
      }
      const [sanitized, allErrors] = sanitizeMutations(resultMutations, {
        allowPositions,
        defaultGene: mutationDefaultGene,
        geneSynonyms,
        geneReferences
      });
      onChange({
        mutations: sanitized
      }, allErrors.length > 0);
    },
    [
      geneOnly,
      allowPositions,
      geneReferences,
      geneSynonyms,
      mutationDefaultGene,
      onChange,
      otherMutations
    ]
  );

  const renderMutTag = React.useCallback(
    ({tag, key, onRemove, classNameRemove, className}) => {
      let {text, errors} = parseAndValidateMutation(tag, {
        allowPositions,
        defaultGene: geneOnly || mutationDefaultGene,
        geneSynonyms,
        geneReferences
      });
      if (geneOnly) {
        text = text.split(':', 2);
        text = text[text.length - 1];
      }

      return (
        <span
         key={key}
         className={className}
         data-error={errors.length > 0}>
          {text}
          <a
           href="#remove-mutation"
           className={classNameRemove}
           onClick={(e) => {e.preventDefault(); onRemove(key);}}>
            {' x'}
          </a>
        </span>
      );
    },
    [
      geneOnly,
      allowPositions,
      mutationDefaultGene,
      geneSynonyms,
      geneReferences
    ]
  );

  const labelText = messages['pattern-analysis-input-label'];

  const errorsElement = useMutationsErrors({
    allowPositions,
    geneOnly,
    defaultGene: mutationDefaultGene,
    geneSynonyms,
    geneReferences,
    messages,
    mutations: filteredMutations,
    parentClassName,
    onChange: handleChange,
    onPreventSubmit: handlePreventSubmit
  });

  return <div className={style['mutations-tagsinput-container']}>
    {labelText ? <label>{labelText}</label> : null}
    <TagsInput
     key="tagsInput"
     tabIndex="0"
     addKeys={[13, 32, 187, 188, 190]}
     addOnBlur
     addOnPaste
     pasteSplit={data => data.split(/[\s,;+.]+/g)}
     value={filteredMutations}
     renderTag={renderMutTag}
     inputProps={{
       placeholder,
       size: placeholder.length,
       className: classNames(
         style['mutations-tagsinput-input'],
         className ? `${className}-input` : null
       )
     }}
     className={classNames(
       style['mutations-tagsinput'],
       className
     )}
     focusedClassName={classNames(
       style['mutations-tagsinput-focused'],
       className ? `${className}-focused` : null
     )}
     tagProps={{
       className: classNames(
         style['mutations-tagsinput-tag'],
         className ? `${className}-tag` : null
       ),
       classNameRemove: classNames(
         style['mutations-tagsinput-remove'],
         className ? `${className}-tag` : null
       )
     }}
     onChange={handleChange} />
    {errorsElement}
  </div>;
}
