import React from 'react';
import shortenMutationList from '../../utils/shorten-mutation-list';

import {getRowKey} from './funcs';
import style from './style.module.scss';


export default function CellMutations({mutations, isolates}) {
  const shortMutations = shortenMutationList(mutations);
  return (
    <div
     key={getRowKey({mutations})}
     className={style['cell-variants']}>
      <div className={style['mutations']}>
        {shortMutations.map(({text}, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 ?
              <span className={style['inline-divider']}> + </span> : null}
            <span className={style['mutation']}>
              {text}
            </span>
          </React.Fragment>
        ))}
      </div>
      {isolates.length > 0 ? 
        <div className={style['variants']}>
          {isolates.join('/')}
        </div> : null}
    </div>
  );
}
