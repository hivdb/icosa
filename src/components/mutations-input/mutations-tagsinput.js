import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TagsInput from 'react-tagsinput';

import {
  parseAndValidateMutation
} from '../../utils/mutation';

import style from './style.module.scss';


function MutationsTagsInput({
  config, mutations, onChange, parentClassName
}) {

  const placeholder = (
    'Enter/paste mutation(s)'
  );

  const className = (
    parentClassName ? `${parentClassName}-tagsinput` : null
  );

  return (
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
  );

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

MutationsTagsInput.propTypes = {
  config: PropTypes.shape({
    geneReferences: PropTypes.object.isRequired
  }),
  mutations: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  parentClassName: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default MutationsTagsInput;
