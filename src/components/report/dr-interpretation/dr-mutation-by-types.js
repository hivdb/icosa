import React from 'react';
import Popup from 'reactjs-popup';
import PropTypes from 'prop-types';
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
  const msgs = config ? (config.messages || {}) : {};

  return (
    <div className={style['dr-report-mutation-by-types']}>
      <dl>
        {mutationsByTypes.reduce((r, {mutationType, mutations}) => {
          mutations = shortenMutationList(
            mutations.filter(mut => !mut.isUnsequenced)
          );
          let MutElem = mutationType !== 'Other' ? 'strong' : 'span';

          let muts = mutations.map((mut, idx) => {
            let mutElem = (
              <MutElem
               data-is-unusual={mut.isUnusual}
               key={idx}>
                {mut.text}
              </MutElem>
            );
            if (mut.isUnusual) {
              mutElem = (
                <Popup
                 key={`popup-${idx}`}
                 on="hover"
                 position={[
                   'bottom center',
                   'right center',
                   'top center',
                   'left center'
                 ]}
                 className={style['unusual-mut-popup']}
                 closeOnDocumentClick
                 keepTooltipInside
                 repositionOnResize
                 trigger={mutElem}>
                  {mut.text} is an unusual mutation
                </Popup>
              );
            }
            return [mutElem, idx + 1 < mutations.length ? ', ' : null];
          });
          if (muts.length === 0) {
            muts = 'None';
          }
          if (mutationType === 'Dosage') {
            return r;
          }
          r.push(
            <dt
             key={`label-${mutationType.toLowerCase()}`}>
              {msgs[`mutation-type-${gene.name}-${mutationType}`] ||
                mutationType} Mutations:
            </dt>
          );
          r.push(
            <dd
             key={`list-${mutationType.toLowerCase()}`}>
              {muts}
            </dd>
          );
          return r;
        }, [])}
      </dl>
    </div>
  );
}
