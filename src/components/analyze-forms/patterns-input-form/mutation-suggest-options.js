import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import {
  expandIndel
} from '../../../utils/mutation';

import style from './style.module.scss';


function MutationSuggestOptions({
  config, onChange
}) {

  const {
    geneDisplay,
    geneReferences: geneRefs,
    mutationSuggestions: mutSuggests
  } = config;

  return (
    <div className={style['mutation-suggest-options']}>
      {mutSuggests.map(({gene, mutations}) => (
        <section key={gene}>
          <h2 className={style.desc}>
            Select {geneDisplay[gene] || gene} mutations:
          </h2>
          <ul>
            {mutations.map(([pos, aas]) => (
              <li key={pos}>
                <label htmlFor={`mut-${gene}-${pos}`}>{pos}</label>
                <Dropdown
                 value={{value: '', label: '---'}}
                 options={Array.from(aas)
                   .map(aa => ({
                     pos,
                     value: `${gene}:${
                       geneRefs[gene][pos - 1]
                     }${pos}${expandIndel(aa)}`,
                     label: expandIndel(aa)
                   }))
                   .concat([{
                     pos,
                     value: `${gene}:${
                       geneRefs[gene][pos - 1]
                     }${pos}`,
                     label: '*'
                   }])
                 }
                 placeholder="---"
                 name={`mut-${gene}-${pos}`}
                 onChange={onChange} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );

}


MutationSuggestOptions.propTypes = {
  config: PropTypes.shape({
    geneReferences: PropTypes.object.isRequired,
    geneDisplay: PropTypes.object.isRequired
  }),
  onChange: PropTypes.func.isRequired
};

export default MutationSuggestOptions;
