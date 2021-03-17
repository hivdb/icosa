import React from 'react';
import shortenMutationList from '../../utils/shorten-mutation-list';

import style from './style.module.scss';
import AntibodyGroup from './antibody-group';
import AntibodyGroupDetail from './antibody-group-detail';


function MutationsGroup({
  queryMuts,
  mutations, hitMutations, hitPositions,
  itemsByAntibody, itemsByAntibodyClass
}) {
  const shortMutations = shortenMutationList(mutations);
  const diffPositions = shortMutations.filter(({posStart, posEnd}) => (
    hitPositions.some(m => (
      m.position >= posStart &&
      m.position <= posEnd
    )) &&
    !hitMutations.some(m => (
      m.position >= posStart &&
      m.position <= posEnd
    ))
  ));
  const diffQueryMuts = shortenMutationList(
    queryMuts.filter(({position}) => (
      diffPositions.some(m => (
        position >= m.posStart &&
        position <= m.posEnd
      ))
    ))
  );
  const missPositions = shortMutations.filter(({posStart, posEnd}) => (
    !hitPositions.some(m => (
      m.position >= posStart &&
      m.position <= posEnd
    ))
  ));
  const [curAbGroupIdx, setCurAbGroupIdx] = React.useState(null);

  return <li
   className={style['mutations-group']}
   data-detail-expanded={curAbGroupIdx !== null}>
    <div className={style['summary-box']}>
      <div className={style['mutations']}>
        {shortMutations.map(({posStart, posEnd, text}, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 ?
              <span className={style['inline-divider']}>+</span> : null}
            <span className={style[
              hitMutations.some(m => (
                m.position >= posStart &&
                m.position <= posEnd
              )) ? 'hit-mutation' : (
                hitPositions.some(m => (
                  m.position >= posStart &&
                  m.position <= posEnd
                )) ? 'diff-mutation' : 'miss-mutation'
              )
            ]}>
              {text}
            </span>
          </React.Fragment>
        ))}
        {diffQueryMuts.length + missPositions.length > 0 ? (
          <div className={style['miss-mutations']}>
            {diffQueryMuts.length > 0 ? <>
              Different from input sequence:{' '}
              {diffQueryMuts.map(({text}, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 ? '; ' : null}
                  {text}
                </React.Fragment>
              ))}
            </> : null}
            {diffQueryMuts.length > 0 && missPositions.length > 0 ?
              <br /> : null}
            {missPositions.length > 0 ? <>
              Absent from input sequence:{' '}
              {missPositions.map(({text}, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 ? '; ' : null}
                  {text}
                </React.Fragment>
              ))}
            </> : null}
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
