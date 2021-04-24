import React from 'react';
import ExtLink from '../link/external';
import {RefLink} from '../references';
import style from './style.module.scss';


export default function CellReferences({refs}) {
  return <ol className={style['cell-references']}>
    {refs.map(({refName}) => <li key={refName}>
      <ExtLink href={`/search-drdb/?article=${refName}`}>
        {refName}
      </ExtLink>
      <RefLink name={refName} />
    </li>)}
  </ol>;
}
