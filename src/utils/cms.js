import {useState, useEffect} from 'react';
import memoize from 'lodash/memoize';


export function useCMS(resourceName, localConfig) {
  const [payload, setPayload] = useState([null, true, null]);

  useEffect(
    () => {
      if (!localConfig?.cmsStages) {
        return;
      }
      let mounted = true;
      const {hostname} = window.location;
      let stage = localConfig.cmsStages[hostname];
      if (!stage) {
        stage = localConfig.cmsStages['*'];
      }
      loadCMS(resourceName, stage)
        .then(payload => mounted ? setPayload([payload, false, false]) : null)
        .catch(error => mounted ? setPayload([error, false, true]) : null);
      return () => mounted = false;
    },
    [localConfig?.cmsStages, resourceName, setPayload]
  );

  return payload;
}


const loadCMS = memoize(async (resourceName, stage) => {
  let payload;
  const resp = await fetch(
    `https://${stage}/${resourceName}`
  );
  if (resp.status === 403 || resp.status === 404) {
    throw new Error(`Page not found: ${resourceName}`);
  }
  payload = await resp.text();
  return payload;
}, (...args) => JSON.stringify(args));


export function getFullLink(path, localConfig) {
  let stage;
  if (!window.__SERVER_RENDERING) {
    const {hostname} = window.location;
    stage = localConfig.cmsStages[hostname];
    if (!stage) {
      stage = localConfig.cmsStages['*'];
    }
  }
  else {
    stage = localConfig.cmsStages['hivdb.stanford.edu'];
  }
  return `https://${stage}/${path}`;
}
