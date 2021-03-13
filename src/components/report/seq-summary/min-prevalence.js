import React from 'react';
import {useRouter} from 'found';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';
import ConfigContext from '../config-context';


export default function MinPrevalence({
  minPrevalence: curValue
}) {
  const {match, router} = useRouter();

  return <ConfigContext.Consumer>
    {({seqReadsMinPrevalenceOptions: options}) => <>
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
    </>}
  </ConfigContext.Consumer>;

  function handleChange({value: cutoff}) {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cutoff = cutoff;
    router.push(newLoc);
  }

}
