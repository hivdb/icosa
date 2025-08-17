import {useCallback} from 'react';
import memoize from 'lodash/memoize';
import sleep from 'sleep-promise';

import Loader from '../../loader';
import useSmartAsync from '../../../utils/use-smart-async';
import type {PromiseFn} from 'react-async';


/**
 * Fetch asynchronous pangolin results and cache by URL.
 */
const fetchPangolinResult = memoize(
  async function(url: string) {
    do {
      const resp = await fetch(url);
      if (resp.status !== 200) {
        await sleep(5000);
        continue;
      }
      const {
        version,
        reports: [{lineage, probability}]
      } = await resp.json() as {
        version: string;
        reports: Array<{lineage: string; probability: number | null}>;
      };
      return {loaded: true, version, lineage, probability};
    }
    while (true); // eslint-disable-line no-constant-condition
  }
);

export {fetchPangolinResult};

interface PangoProps {
  lineage?: string;
  probability?: number | null;
  version?: string;
  loaded?: boolean;
  asyncResultsURI: string;
}

/**
 * Resolve PANGO lineage information via asynchronous results or remote fetch.
 *
 * @param args - PANGO query parameters and cached result data.
 * @returns Asynchronous state containing lineage data.
 */
export function usePangoLineage({
  lineage,
  probability,
  version,
  loaded,
  asyncResultsURI
}: PangoProps) {
  const asyncFetch = useCallback<PromiseFn<{
    loaded: boolean;
    version: string | undefined;
    lineage: string | undefined;
    probability: number | null | undefined;
  }>>(async (props) => {
    const {url = ''} = props as {url?: string};
      if (loaded) {
        return {
          loaded: true,
          version,
          lineage,
          probability
        };
      }
      return await fetchPangolinResult(url);
    },
    [loaded, version, lineage, probability]
  );
  return useSmartAsync({
    promiseFn: asyncFetch,
    url: asyncResultsURI
  });
}

interface PangoLineageComponentProps extends PangoProps {
  bestMatchingSubtype?: {display: string};
  subtypes?: unknown[];
}

/**
 * Present the inferred PANGO lineage with probability and version details.
 *
 * @param pangolin - {@link PangoLineageComponentProps} containing lineage
 *   information and query options.
 * @returns Definition list entries displaying lineage information.
 */
export default function PangoLineage({
  ...pangolin
}: PangoLineageComponentProps) {
  const {data, error, isPending} = usePangoLineage(pangolin);

  let child;
  if (error) {
    child = `Error! ${error.message}`;
  }
  else if (isPending) {
    child = <Loader inline />;
  }
    else {
      const {lineage, probability = null, version} = data!;
      child = `${lineage} (Prob=${
        probability === null ? 'NA' : probability.toFixed(1)
      }; ${version})`;
    }
  return <>
    <dt>PANGO lineage:</dt>
    <dd>{child}</dd>
  </>;

}
