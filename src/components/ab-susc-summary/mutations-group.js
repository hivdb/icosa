import React from 'react';
import shortenMutationList from '../../utils/shorten-mutation-list';

import style from './style.module.scss';
import AntibodyGroup from './antibody-group';
import AntibodyGroupDetail from './antibody-group-detail';


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
  const [curAbGroupIdx, setCurAbGroupIdx] = React.useState(null);

  return <li
   className={style['mutations-group']}
   data-detail-expanded={curAbGroupIdx !== null}>
    <div className={style['summary-box']}>
      <div className={style['mutations']}>
        {shortMutations.map(({startPos, endPos, text}, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 ?
              <span className={style['inline-divider']}>+</span> : null}
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
          <AntibodyGroup
           isCurrent={idx === curAbGroupIdx}
           onClick={handleAbGroupClick(idx)}
           key={idx} {...item} />
        ))}
      </ul>
    </div>
    <AntibodyGroupDetail
     display={curAbGroupIdx !== null}
     {...(curAbGroupIdx === null || itemsByAntibody[curAbGroupIdx])} />
  </li>;

  function handleAbGroupClick(idx) {
    return evt => {
      evt && evt.preventDefault();
      if (curAbGroupIdx === idx) {
        setCurAbGroupIdx(null);
      }
      else {
        setCurAbGroupIdx(idx);
      }
    };
  }

}


export default MutationsGroup;
