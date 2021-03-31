import React from 'react';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';

import {
  parseAndValidateMutation
} from '../../../utils/mutation';

import style from './style.module.scss';


function MutationsTagsInput({
  config, mutations, onChange
}) {

  const placeholder = (
    'Enter/paste mutation(s); examples: S:E484K, nsp6:S106del, nsp6:34ins'
  );

  return (
    <TagsInput
     key="tagsInput"
     tabIndex="0"
     addKeys={[13, 32, 187, 188, 190]}
     addOnBlur
     addOnPaste
     pasteSplit={data => data.split(/[\s,;:+.]+/g)}
     value={mutations}
     renderTag={renderMutTag}
     inputProps={{
       placeholder,
       size: placeholder.length,
       className: style['mutations-tagsinput-input']
     }}
     className={style['mutations-tagsinput']}
     focusedClassName={style['mutations-tagsinput-focused']}
     tagProps={{
       className: style['mutations-tagsinput-tag'],
       classNameRemove: style['mutations-tagsinput-remove']
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
  onChange: PropTypes.func.isRequired
};

export default MutationsTagsInput;
