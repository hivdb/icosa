import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TagsInput from 'react-tagsinput';

import {
  parseAndValidateMutation
} from '../../utils/mutation';

import style from './style.module.scss';


MutationsTagsInput.propTypes = {
  config: PropTypes.shape({
    geneReferences: PropTypes.object.isRequired,
    messages: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired
  }),
  mutations: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  parentClassName: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default function MutationsTagsInput({
  config, mutations, onChange, parentClassName
}) {

  const placeholder = (
    config.messages['pattern-analysis-input-placeholder'] ||
    '<pattern-analysis-input-placeholder>'
  );

  const className = (
    parentClassName ? `${parentClassName}-tagsinput` : null
  );

  return <div className={style['mutations-tagsinput-container']}>
    <label>
      {
        config.messages['pattern-analysis-input-label'] ||
        '<pattern-analysis-input-label>'
      }
    </label>
    <TagsInput
     key="tagsInput"
     tabIndex="0"
     addKeys={[13, 32, 187, 188, 190]}
     addOnBlur
     addOnPaste
     pasteSplit={data => data.split(/[\s,;+.]+/g)}
     value={mutations}
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
     onChange={onChange} />
  </div>;

  function renderMutTag({tag, key, onRemove, classNameRemove, className}) {
    const {text, errors} = parseAndValidateMutation(tag, config);

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
  }
}
