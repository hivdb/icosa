import React from 'react';
import ExtLink from '../../link/external';

import InlineLoader from '../../inline-loader';
import {usePangoLineage} from './pango-lineage';

import style from './style.module.scss';


function useOutbreakInfo(props) {
  const {
    data: pangoData,
    error,
    isPending
  } = usePangoLineage(props);
  const {
    config: {
      outbreakInfo: {
        lineages: {
          results
        }
      }
    }
  } = props;
  let data = [];
  if (!error && !isPending) {
    data = results.filter(
      ({name}) => (
        name.toLocaleUpperCase('en-US') ===
        pangoData.lineage.toLocaleUpperCase('en-US')
      )
    );
  }
  return {data, error, isPending};
}


export default function OutbreakInfo(props) {
  const {data, error, isPending} = useOutbreakInfo(props);

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
      {data.map(({name, total_count: totalCount}) => {
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
