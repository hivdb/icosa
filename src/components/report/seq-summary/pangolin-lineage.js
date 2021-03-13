import React from 'react';
import sleep from 'sleep-promise';

import InlineLoader from '../../inline-loader';
import PromiseComponent from '../../../utils/promise-component';


export default function PangolinLineage(pangolin) {
  const {
    lineage,
    probability,
    version,
    loaded,
    asyncResultsURI
  } = pangolin;
  if (loaded) {
    return <>
      <dt>Pangolin lineage:</dt>
      <dd>
        {lineage} (Prob={probability.toFixed(1)}; {version})
      </dd>
    </>;
  }
  else {
    const asyncResult = async () => {
      do {
        const resp = await fetch(asyncResultsURI);
        if (resp.status !== 200) {
          await sleep(2000);
          continue;
        }
        const {
          version,
          reports: [{lineage, probability}]
        } = await resp.json();
        return {loaded: true, version, lineage, probability};
      }
      while(true); // eslint-disable-line no-constant-condition
    };
    return <>
      <dt>Pangolin lineage:</dt>
      <PromiseComponent
       promise={asyncResult()}
       then={({lineage, probability, version}) => <dd>
         {lineage} (Prob={probability.toFixed(1)}; {version})
       </dd>}>
        <dd><InlineLoader /></dd>
      </PromiseComponent>
    </>;
  }
}
