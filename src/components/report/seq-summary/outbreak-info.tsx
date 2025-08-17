import React from 'react';
import ExtLink from '../../link/external';

import Loader from '../../loader';
import {usePangoLineage} from './pango-lineage';

import style from './style.module.scss';

interface OutbreakInfoProps {
  config: {
    outbreakInfo: {
      lineages: {results: Array<{name: string; total_count: number}>};
    };
  };
  asyncResultsURI: string;
  lineage?: string;
  probability?: number | null;
  version?: string;
  loaded?: boolean;
}

/**
 * Retrieve outbreak information corresponding to the PANGO lineage from
 * Outbreak.info dataset.
 */
function useOutbreakInfo(props: OutbreakInfoProps) {
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
  let data: Array<{name: string; total_count: number}> = [];
  if (!error && !isPending && pangoData) {
    data = results.filter(
      ({name}) =>
        name.toLocaleUpperCase('en-US') ===
        pangoData.lineage?.toLocaleUpperCase('en-US')
    );
  }
  return {data, error, isPending};
}


/**
 * Display outbreak statistics for the resolved PANGO lineage. Data is fetched
 * via {@link useOutbreakInfo} which queries Outbreak.info.
 *
 * @param props - {@link OutbreakInfoProps} including configuration and
 *   lineage lookup information.
 * @returns Definition list entries displaying outbreak data.
 */
export default function OutbreakInfo(props: OutbreakInfoProps) {
  const {data, error, isPending} = useOutbreakInfo(props);

  let child;
  if (error) {
    child = `Error! ${error.message}`;
  }
  else if (isPending) {
    child = <Loader inline />;
  }
  else {
    child = <ul className={style['outbreak-info-list']}>
      {data.length === 0 ? <li>PANGO lineage not available</li> : null}
      {data.map(({name, total_count: totalCount}) => {
        const url = new URL('https://outbreak.info/situation-reports');
        url.searchParams.append('pango', name);
        return <li key={name}>
          <ExtLink href={url.toString()}>
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
