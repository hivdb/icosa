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
  const diffPositions = shortMutations.filter(({startPos, endPos}) => (
    hitPositions.some(m => (
      m.position >= startPos &&
      m.position <= endPos
    )) &&
    !hitMutations.some(m => (
      m.position >= startPos &&
      m.position <= endPos
    ))
  ));
  const diffQueryMuts = shortenMutationList(
    queryMuts.filter(({position}) => (
      diffPositions.some(m => (
        position >= m.startPos &&
        position <= m.endPos
      ))
    ))
  );
  const missPositions = shortMutations.filter(({startPos, endPos}) => (
    !hitPositions.some(m => (
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
              hitMutations.some(m => (
                m.position >= startPos &&
                m.position <= endPos
              )) ? 'hit-mutation' : (
                hitPositions.some(m => (
                  m.position >= startPos &&
                  m.position <= endPos
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
