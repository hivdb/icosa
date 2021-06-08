import React from 'react';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


function MaxMixturePcnt({
  match,
  router,
  config: {seqReadsMaxMixturePcnt: options},
  maxMixturePcnt: curValue,
  mixturePcnt: actualValue
}) {

  return <>
    <dt className={style['has-dropdown']}>
      Nucleotide mixture threshold:
    </dt>
    <dd className={style['has-dropdown']} data-wide-dropdown>
      <Dropdown
       value={options.find(({value}) => value === curValue)}
       placeholder="..."
       options={options}
       name="cutoff"
       onChange={handleChange} />
      <span className={style['dropdown-after']}>
        (actual: {(actualValue * 100).toPrecision(2)}%)
      </span>
    </dd>
  </>;

  function handleChange({value: mixpcnt}) {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.mixpcnt = mixpcnt;
    router.push(newLoc);
  }

}


export default React.memo(MaxMixturePcnt);
