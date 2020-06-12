import React from 'react';
import config from '../../config';

import style from './style.module.scss';

const mutTypeLabels = config.mutationTypesByGenes;


export default class DRMutationByTypes extends React.Component {

  render() {
    const {gene, mutationsByTypes} = this.props;

    return (
      <div className={style.drReportMutationByTypes}>
        <dl>
          {mutationsByTypes.reduce((r, {mutationType, mutations}) => {
            mutations = mutations.filter(mut => !mut.isUnsequenced);
            let MutElem = mutationType !== 'Other' ? 'strong' : 'span';
            let muts = mutations.map((mut, idx) => [
              <MutElem key={idx}>{mut.text}</MutElem>,
              idx + 1 < mutations.length ? ', ' : null
            ]);
            if (muts.length === 0) {
              muts = 'None';
            }
            if (mutationType === 'Dosage') {
              return r;
            }
            r.push(
              <dt
               key={`label-${mutationType.toLowerCase()}`}>
                {mutTypeLabels[gene.name][mutationType]} Mutations:
              </dt>);
            r.push(
              <dd
               key={`list-${mutationType.toLowerCase()}`}>
                {muts}
              </dd>);
            return r;
          }, [])}
        </dl>
      </div>
    );
  }
}
