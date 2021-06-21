import React from 'react';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';


function MaxMixtureRate({
  match,
  router,
  config: {seqReadsMaxMixtureRate: options},
  maxMixtureRate: curValue,
  mixtureRate: actualValue
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
        (actual: {actualValue === 0. ? 0 : (actualValue *
        100).toPrecision(2)}%)
      </span>
    </dd>
  </>;

  function handleChange({value: mixrate}) {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.mixrate = mixrate;
    router.push(newLoc);
  }

}


export default React.memo(MaxMixtureRate);
