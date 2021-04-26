import React from 'react';
import memoize from 'lodash/memoize';
import sleep from 'sleep-promise';

import InlineLoader from '../../inline-loader';
import useSmartAsync from '../../../utils/use-smart-async';


const fetchPangolinResult = memoize(
  async function(url) {
    do {
      const resp = await fetch(url);
      if (resp.status !== 200) {
        await sleep(5000);
        continue;
      }
      const {
        version,
        reports: [{lineage, probability}]
      } = await resp.json();
      return {loaded: true, version, lineage, probability};
    }
    while(true); // eslint-disable-line no-constant-condition
  }
);


export function usePangoLineage({
  lineage,
  probability,
  version,
  loaded,
  asyncResultsURI
}) {
  const asyncFetch = React.useCallback(
    async ({url}) => {
      if (loaded) {
        return {
          loaded: true,
          version,
          lineage,
          probability
        };
      }
      else {
        return await fetchPangolinResult(url);
      }
    },
    [loaded, version, lineage, probability]
  );
  return useSmartAsync({
    promiseFn: asyncFetch,
    url: asyncResultsURI
  });

}


export default function PangoLineage(pangolin) {
  const {data, error, isPending} = usePangoLineage(pangolin);

  let child;
  if (error) {
    child = `Error! ${error.message}`;
  }
  else if (isPending) {
    child = <InlineLoader />;
  }
  else {
    const {lineage, probability, version} = data;
    child = `${lineage} (Prob=${probability.toFixed(1)}; ${version})`;
  }
  return <>
    <dt>PANGO lineage:</dt>
    <dd>{child}</dd>
  </>;

}
