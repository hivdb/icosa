import React from 'react';
import shortenMutationList from '../../utils/shorten-mutation-list';

import style from './style.module.scss';
import AntibodyGroup from './antibody-group';


function MutationsGroup({
  mutations, hitMutations,
  itemsByAntibody, itemsByAntibodyClass
}) {
  const shortMutations = shortenMutationList(mutations);
  const shortMissMutations = shortMutations.filter(({startPos, endPos}) => (
    !hitMutations.find(m => (
      m.position >= startPos &&
      m.position <= endPos
    ))
  ));

  return <li className={style['mutations-group']}>
    <div className={style['mutations']}>
      {shortMutations.map(({startPos, endPos, text}, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 ? <span className={style['inline-divider']}>+</span> : null}
          <span className={style[
            hitMutations.find(m => (
              m.position >= startPos &&
              m.position <= endPos
            )) ? 'hit-mutation' : 'miss-mutation'
          ]}>
            {text}
          </span>
        </React.Fragment>
      ))}
      {shortMissMutations.length > 0 ? (
        <div className={style['miss-mutations']}>
          {'Absent from the input sequence: '}
          {shortMissMutations.map(({text}, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 ? '; ' : null}
              {text}
            </React.Fragment>
          ))}
        </div>
      ) : null}
    </div>
    <ul className={style['antibody-groups']}>
      {itemsByAntibody.map((item, idx) => (
        <AntibodyGroup key={idx} {...item} />
      ))}
    </ul>
  </li>;
}


export default MutationsGroup;
