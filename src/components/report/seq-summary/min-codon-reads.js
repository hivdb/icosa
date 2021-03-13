import React from 'react';
import {useRouter} from 'found';
import Dropdown from 'react-dropdown';

import style from './style.module.scss';
import ConfigContext from '../config-context';


export default function MinCodonReads({
  minCodonReads: curValue
}) {
  const {match, router} = useRouter();

  return <ConfigContext.Consumer>
    {({seqReadsMinCodonReadsOptions: options}) => <>
      <dt className={style['has-dropdown']}>
        Read depth threshold by codon:
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

  function handleChange({value: cdreads}) {
    const newLoc = {...match.location};
    newLoc.query = newLoc.query ? newLoc.query : {};
    newLoc.query.cdreads = cdreads;
    router.push(newLoc);
  }

}
