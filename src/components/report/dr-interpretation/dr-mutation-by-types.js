import React from 'react';
import PropTypes from 'prop-types';

import Mutation from '../../mutation';
import ConfigContext from '../../../utils/config-context';

import shortenMutationList from '../../../utils/shorten-mutation-list';


import style from './style.module.scss';

DRMutationByTypes.propTypes = {
  gene: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  mutationsByTypes: PropTypes.array.isRequired
};


export default function DRMutationByTypes({gene, mutationsByTypes}) {
  const [config] = ConfigContext.use();
  const {
    messages: msgs,
    mutationTypesByGenes,
    hideEmptyMutationTypes
  } = config ?? {};
  const mutationTypes = mutationTypesByGenes?.[gene.name] ?? [];

  const elements = (
    mutationsByTypes.reduce((r, {mutationType, mutations}) => {
      mutations = shortenMutationList(
        mutations.filter(mut => !mut.isUnsequenced)
      );
      let muts = mutations.map((mut, idx) => (
        <Mutation key={idx} {...mut} gene={gene.name} config={config} />
      ));
      if (muts.length === 0) {
        muts = 'None';
        if (hideEmptyMutationTypes) {
          return r;
        }
      }
      if (mutationType === 'Dosage') {
        return r;
      }
      if (!(mutationType in mutationTypes)) {
        return r;
      }
      r.push(
        <dt
         key={`label-${mutationType.toLowerCase()}`}>
          {msgs[`mutation-type-${gene.name}-${mutationType}`] ??
            mutationTypes[mutationType] ??
            mutationType} Mutations:
        </dt>
      );
      r.push(
        <dd
         key={`list-${mutationType.toLowerCase()}`}>
          <ul className={style['typed-mutation-list']}>
            {muts}
          </ul>
        </dd>
      );
      return r;
    }, [])
  );

  return (
    <div className={style['dr-report-mutation-by-types']}>
      {elements.length > 0 ? <dl>{elements}</dl> : <>
        {msgs['no-mutations-found'] ?? 'No mutations were found in this sequence.'}
      </>}
    </div>
  );
}
