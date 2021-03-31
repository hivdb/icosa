import React from 'react';
import PropTypes from 'prop-types';

import ConfigContext from '../../report/config-context';
import {
  sanitizeMutations
} from '../../../utils/mutation';

import MutationsTagsInput from './mutations-tagsinput';
import MutationsErrors from './mutations-errors';
import MutationSuggestOptions from './mutation-suggest-options';
import style from './style.module.scss';


function MutationsInputInternal({
  config, uuid, name, mutations, onChange, isActive
}) {
  const [,allErrors] = sanitizeMutations(mutations, config);

  return (
    <div key={uuid} className={style['mutation-suggest-input']}>
      <MutationsTagsInput
       config={config}
       mutations={mutations}
       onChange={handleTagsChange} />
      <MutationsErrors
       allErrors={allErrors}
       onAutoClean={handleRemoveAllErrors} />
      <MutationSuggestOptions
       config={config}
       onChange={handleMutationSelect} />
    </div>
  );

  function handleRemoveAllErrors(e) {
    e.preventDefault();
    const [sanitized] = sanitizeMutations(mutations, config, true);
    onChange({
      uuid,
      name,
      mutations: sanitized
    }, false);
  }

  function handleTagsChange(mutations) {
    const [sanitized, allErrors] = sanitizeMutations(mutations, config);
    onChange({
      uuid,
      name,
      mutations: sanitized
    }, allErrors.length > 0);
  }

  function handleMutationSelect({value: mut, label}) {
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
      uuid,
      name,
      mutations: sanitized
    }, allErrors.length > 0);
  }

}
  

MutationsInputInternal.propTypes = {
  config: PropTypes.shape({
    geneReferences: PropTypes.object.isRequired,
    geneDisplay: PropTypes.object.isRequired
  }),
  uuid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  mutations: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired
};

export default function MutationsInput(props) {
  return <ConfigContext.Consumer>
    {config => <MutationsInputInternal {...props} config={config} />}
  </ConfigContext.Consumer>;
}
