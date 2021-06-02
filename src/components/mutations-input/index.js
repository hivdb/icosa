import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  sanitizeMutations
} from '../../utils/mutation';

import MutationsTagsInput from './mutations-tagsinput';
import MutationsErrors from './mutations-errors';
import useMutationPrefills from './mutation-prefills';
// import MutationSuggestOptions from './mutation-suggest-options';
import style from './style.module.scss';


function MutationsInput({
  config, mutations, className, onChange, isActive, ...extras
}) {
  const [,allErrors] = sanitizeMutations(mutations, config);
  const handlePrefillSelect = React.useCallback(
    option => {
      onChange({
        ...extras,
        ...(option || {mutations: []})
      }, false);
    },
    [onChange, extras]
  );
  const prefillElement = useMutationPrefills(handlePrefillSelect, config);

  React.useEffect(() => {
    if (allErrors.length > 0) {
      onChange({}, true);
    }
  });

  return (
    <div className={classNames(
      style['mutation-suggest-input'],
      className,
    )}>
      <div className={style['mutation-main-input']}>
        {prefillElement}
        <div className={style['or']}>or</div>
        <MutationsTagsInput
         config={config}
         parentClassName={className}
         mutations={mutations}
         onChange={handleTagsChange} />
      </div>
      <MutationsErrors
       allErrors={allErrors}
       parentClassName={className}
       onAutoClean={handleRemoveAllErrors} />
      {/*<MutationSuggestOptions
       config={config}
       onChange={handleMutationSelect} />*/}
    </div>
  );

  function handleRemoveAllErrors(e) {
    e.preventDefault();
    const [sanitized] = sanitizeMutations(mutations, config, true);
    onChange({
      ...extras,
      mutations: sanitized
    }, false);
  }

  function handleTagsChange(mutations) {
    const [sanitized, allErrors] = sanitizeMutations(mutations, config);
    onChange({
      ...extras,
      mutations: sanitized
    }, allErrors.length > 0);
  }

  /* function handleMutationSelect({value: mut, label}) {
    if (mut.length === 0) {
      return;
    }
    else if (label === '*') {
      const aas = prompt(
        `Please enter mutated amino acid(s) at position ${mut}`
      );
      if (aas === null) {
        return;
      }
      mut = `${mut}${aas}`;
    }
    const [sanitized, allErrors] = sanitizeMutations(
      [...mutations, mut], config
    );
    onChange({
      ...extras,
      mutations: sanitized
    }, allErrors.length > 0);
  } */

}
  

MutationsInput.propTypes = {
  config: PropTypes.shape({
    geneReferences: PropTypes.object.isRequired,
    geneDisplay: PropTypes.object.isRequired
  }),
  className: PropTypes.string,
  mutations: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired
};

MutationsInput.defaultProps = {
  isActive: true,
  mutations: []
};

export default MutationsInput;
