import React from 'react';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


function MinPrevalence({
  match,
  router,
  config: {seqReadsMinPrevalenceOptions: options},
  minPrevalence: curValue
}) {

  return <>
    <dt className={style['has-dropdown']}>
      Mutation detection threshold:
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

  function handleChange({value: cutoff}) {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cutoff = cutoff;
    router.push(newLoc);
  }

}


export default React.memo(MinPrevalence);
