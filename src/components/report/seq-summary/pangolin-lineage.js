import React from 'react';
import sleep from 'sleep-promise';

import InlineLoader from '../../inline-loader';
import useSmartAsync from '../../../utils/use-smart-async';


async function fetchPangolinResult({url}) {
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


function AsyncPangolinLineage(pangolin) {
  const {
    asyncResultsURI
  } = pangolin;
  const {data, error, isPending} = useSmartAsync({
    promiseFn: fetchPangolinResult,
    url: asyncResultsURI
  });
  if (error) {
    return `Error! ${error.message}`;
  }
  if (isPending) {
    return <InlineLoader />;
  }
  const {lineage, probability, version} = data;
  return <dd>
    {lineage} (Prob={probability.toFixed(1)}; {version})
  </dd>;
}


export default function PangolinLineage(pangolin) {
  const {
    lineage,
    probability,
    version,
    loaded
  } = pangolin;
  return <>
    <dt>Pangolin lineage:</dt>
    {loaded ?
      <dd>
        {lineage} (Prob={probability.toFixed(1)}; {version})
      </dd> :
      <AsyncPangolinLineage {...pangolin} />
    }
  </>;
}
