import {useEffect, useState} from 'react';
import memoize from 'lodash/memoize';

/** Shape of the CMS stage configuration. */
export interface CMSConfig {
  cmsStages: Record<string, string>;
}

/**
 * React hook to fetch content from a CMS based on hostname and resource name.
 *
 * @param resourceName - The CMS resource to load.
 * @param localConfig - Local configuration containing stage mapping.
 * @returns Tuple of [payload, pending, isError].
 */
export function useCMS(
  resourceName: string,
  localConfig: CMSConfig
): [string | Error | null, boolean, boolean] {
    const [payload, setPayload] = useState<[string | Error | null, boolean, boolean]>([null, true, false]);

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
        .then(data => mounted ? setPayload([data, false, false]) : null)
        .catch(error => mounted ? setPayload([error, false, true]) : null);
      return () => { mounted = false; };
    },
    [localConfig?.cmsStages, resourceName]
  );

  return payload;
}

const loadCMS = memoize(async (resourceName: string, stage: string) => {
  const resp = await fetch(
    `https://${stage}/${resourceName}`
  );
  if (resp.status === 403 || resp.status === 404) {
    throw new Error(`Page not found: ${resourceName}`);
  }
  return await resp.text();
}, (...args) => JSON.stringify(args));

/**
 * Get a full URL to a CMS resource based on the current hostname.
 * @param path - The resource path.
 * @param localConfig - CMS configuration with stage mapping.
 * @returns Fully qualified URL pointing to the resource.
 */
export function getFullLink(path: string, localConfig: CMSConfig): string {
  let stage: string | undefined;
  if (!(window as any).__SERVER_RENDERING) {
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
