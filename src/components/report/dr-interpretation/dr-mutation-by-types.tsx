import React from 'react';

import Mutation from '../../mutation';
import ConfigContext from '../../../utils/config-context';

import shortenMutationList from '../../../utils/shorten-mutation-list';

import style from './style.module.scss';

interface MutationItem {
  text: string;
  isUnsequenced: boolean;
  [key: string]: any;
}

interface MutationGroup {
  mutationType: string;
  mutations: MutationItem[];
}

interface Gene {
  name: string;
}

interface DRMutationByTypesProps {
  gene: Gene;
  mutationsByTypes: MutationGroup[];
}

/**
 * List mutations grouped by type, excluding dosage mutations and unsequenced ones.
 */
export default function DRMutationByTypes({gene, mutationsByTypes}: DRMutationByTypesProps) {
  const [config] = ConfigContext.use();
  if (!config) {
    return null;
  }
  const msgs = config.messages || {};

  return (
    <div className={style['dr-report-mutation-by-types']}>
      <dl>
        {mutationsByTypes.reduce<React.ReactNode[]>((r, {mutationType, mutations}) => {
          mutations = shortenMutationList(mutations.filter(mut => !mut.isUnsequenced));
          let muts: React.ReactNode | React.ReactNode[] = mutations.map((mut, idx) => (
            <Mutation key={idx} {...mut} gene={gene.name} config={config} />
          ));
          if ((muts as React.ReactNode[]).length === 0) {
            muts = 'None';
          }
          if (mutationType === 'Dosage') {
            return r;
          }
          r.push(
            <dt key={`label-${mutationType.toLowerCase()}`}>
              {msgs[`mutation-type-${gene.name}-${mutationType}`] || mutationType} Mutations:
            </dt>
          );
          r.push(
            <dd key={`list-${mutationType.toLowerCase()}`}>
              <ul className={style['typed-mutation-list']}>{muts}</ul>
            </dd>
          );
          return r;
        }, [])}
      </dl>
    </div>
  );
}
