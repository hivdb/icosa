import React from 'react';
import memoize from 'lodash/memoize';
import ExtLink from '../../link/external';

import useSmartAsync from '../../../utils/use-smart-async';
import InlineLoader from '../../inline-loader';
import {usePangoLineage} from './pango-lineage';

import style from './style.module.scss';


const fetchOutbreakLineage = memoize(
  async function(lineage) {
    const url = new URL('https://api.outbreak.info/genomics/lineage');
    url.searchParams.append('name', lineage);

    const resp = await fetch(url);
    const {success, results} = await resp.json();
    if (success) {
      return results.map(
        ({name, total_count: totalCount}) => ({name, totalCount})
      );
    }
    else {
      throw new Error('Unable to access api.outbreak.info');
    }
  }
);


function useOutbreakInfo(pangolin) {
  const {
    data: pangoData,
    error: pangoError,
    isPending: pangoIsPending} = usePangoLineage(pangolin);
  const pangoLoaded = !pangoError && !pangoIsPending;
  const asyncFetch = React.useCallback(
    async ({lineage}) => {
      if (pangoLoaded) {
        return await fetchOutbreakLineage(lineage);
      }
      return [];
    },
    [pangoLoaded]
  );

  const {
    data,
    error,
    isPending
  } = useSmartAsync({
    promiseFn: asyncFetch,
    lineage: pangoLoaded ? pangoData.lineage : undefined
  });
  const loaded = pangoLoaded && !error && !isPending;
  return {data, error, isPending: !loaded};
}


export default function OutbreakInfo(pangolin) {
  const {data, error, isPending} = useOutbreakInfo(pangolin);

  let child;
  if (error) {
    child = `Error! ${error.message}`;
  }
  else if (isPending) {
    child = <InlineLoader />;
  }
  else {
    child = <ul className={style['outbreak-info-list']}>
      {data.length === 0 ? <li>PANGO lineage not available</li> : null}
      {data.map(({name, totalCount}) => {
        const url = new URL('https://outbreak.info/situation-reports');
        url.searchParams.append('pango', name);
        return <li key={name}>
          <ExtLink href={url}>
            {name.toLocaleUpperCase('en-US')}{' '}
            (n={totalCount.toLocaleString('en-US')})
          </ExtLink>
        </li>;
      })}
    </ul>;
  }
  return <>
    <dt>Outbreak.info:</dt>
    <dd>{child}</dd>
  </>;

}
