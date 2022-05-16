import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {
  sanitizeMutations
} from '../../utils/mutation';

import MutationsTagsInput from './mutations-tagsinput';
import useMutationPrefills from './mutation-prefills';
import MutationSuggestOptions from './mutation-suggest-options';
import style from './style.module.scss';


MutationsInput.propTypes = {
  config: PropTypes.shape({
    mutationSplitGeneInput: PropTypes.bool,
    mutationSuggestions: PropTypes.arrayOf(
      PropTypes.shape({
        gene: PropTypes.string.isRequired,
        mutations: PropTypes.array.isRequired
      }).isRequired
    ).isRequired,
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

export default function MutationsInput({
  config,
  mutations,
  className,
  onChange,
  isActive, // eslint-disable-line no-unused-vars
  ...extras
}) {
  const {
    mutationSplitGeneInput: splitGeneInput,
    mutationSuggestions
  } = config;

  const handleChange = React.useCallback(
    (payload, preventSubmit) => onChange(
      {...extras, ...payload},
      preventSubmit
    ),
    [onChange, extras]
  );

  const prefillElement = useMutationPrefills({
    onChange: handleChange,
    config
  });

  const handleMutationSelect = React.useCallback(
    ({value: mut, label}) => {
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
      const [
        sanitized,
        allErrors
      ] = sanitizeMutations([...mutations, mut], config);
      handleChange({
        mutations: sanitized
      }, allErrors.length > 0);
    },
    [config, mutations, handleChange]
  );

  return (
    <div className={classNames(
      style['mutation-suggest-input'],
      className
    )}>
      {splitGeneInput ? null :
      <div className={style['mutation-main-input']}>
        {prefillElement}
        <div className={style['or']}>or</div>
        <MutationsTagsInput
         config={config}
         parentClassName={className}
         mutations={mutations}
         onChange={handleChange} />
      </div>}
      {mutationSuggestions && mutationSuggestions.length > 0 ?
        <div className={style['mutation-main-input-with-columns']}>
          {mutationSuggestions.map(({gene, mutations: suggestMuts}) => (
            <MutationSuggestOptions
             key={gene}
             gene={gene}
             mutations={suggestMuts}
             config={config}
             onChange={handleMutationSelect}>
              {splitGeneInput ?
                <MutationsTagsInput
                 geneOnly={gene}
                 config={config}
                 parentClassName={className}
                 mutations={mutations}
                 onChange={handleChange} /> : null}
            </MutationSuggestOptions>
          ))}
        </div> : null}
    </div>
  );

}
