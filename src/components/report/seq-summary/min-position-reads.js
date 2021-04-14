import React from 'react';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


function MinPositionReads({
  match, router,
  config: {seqReadsMinPositionReadsOptions: options},
  minPositionReads: curValue
}) {

  return <>
    <dt className={style['has-dropdown']}>
      Read depth threshold by position:
    </dt>
    <dd className={style['has-dropdown']}>
      <Dropdown
       value={options.find(({value}) => value === curValue)}
       placeholder="..."
       options={options}
       name="cutoff"
       onChange={handleChange} />
    </dd>
  </>;

  function handleChange({value: cdreads}) {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cdreads = cdreads;
    router.push(newLoc);
  }

}

export default React.memo(MinPositionReads);
