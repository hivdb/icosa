import React from 'react';
import memoize from 'lodash/memoize';

import createAsyncContext from './async-context';


const fetchConfig = memoize(
  async url => {
    const resp = await fetch(url);
    return await resp.json();
  }
);


export function useConfigLoader(config) {

  return React.useCallback(
    async () => {
      let loadedConfig;
      if (config.configFromURL) {
        const asyncConfig = await fetchConfig(config.configFromURL);
        loadedConfig = {
          ...config,
          ...asyncConfig
        };
      }
      else {
        loadedConfig = config;
      }

      return new Proxy(loadedConfig, {
        get(target, name) {
          return Object.freeze(target[name]);
        }
      });
    },
    [config]
  );
}


export default createAsyncContext({});
