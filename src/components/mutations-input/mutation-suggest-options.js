import React from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'react-dropdown';

import {
  expandIndel
} from '../../utils/mutation';

import style from './style.module.scss';


MutationSuggestOptions.propTypes = {
  gene: PropTypes.string.isRequired,
  mutations: PropTypes.array.isRequired,
  config: PropTypes.shape({
    geneReferences: PropTypes.object.isRequired,
    geneDisplay: PropTypes.object.isRequired,
    messages: PropTypes.objectOf(
      PropTypes.string.isRequired
    ).isRequired
  }),
  children: PropTypes.node,
  onChange: PropTypes.func.isRequired
};

function MutationSuggestOptions({
  gene,
  mutations,
  config: {
    geneDisplay,
    geneReferences,
    messages
  },
  children,
  onChange
}) {

  return (
    <section key={gene} className={style['gene-mutation-input']}>
      <h2 className={style.desc}>
        {messages[`pattern-analysis-suggest-options-label-${gene}`] ||
         `Select ${geneDisplay[gene] || gene} mutations:`}
      </h2>
      {children}
      <ul className={style['gene-mutation-suggest-options']}>
        {mutations.map(([pos, aas]) => (
          <li key={pos}>
            <label htmlFor={`mut-${gene}-${pos}`}>{pos}</label>
            <Dropdown
             value={{value: '', label: '---'}}
             options={Array.from(aas)
               .map(aa => ({
                 pos,
                 value: `${gene}:${
                   geneReferences[gene][pos - 1]
                 }${pos}${expandIndel(aa)}`,
                 label: expandIndel(aa)
               }))
               .concat([{
                 pos,
                 value: `${gene}:${
                   geneReferences[gene][pos - 1]
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
  );

}

export default MutationSuggestOptions;
