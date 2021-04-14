import React from 'react';
import sleep from 'sleep-promise';

import InlineLoader from '../../inline-loader';
import PromiseComponent from '../../../utils/promise-component';


function AsyncPangolinLineage(pangolin) {
  const {
    asyncResultsURI
  } = pangolin;
  const asyncResult = React.useMemo(
    async () => {
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
    },
    [asyncResultsURI]
  );
  return (
    <PromiseComponent
     promise={asyncResult}
     then={({lineage, probability, version}) => <dd>
       {lineage} (Prob={probability.toFixed(1)}; {version})
     </dd>}>
      <dd><InlineLoader /></dd>
    </PromiseComponent>
  );
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
