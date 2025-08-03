import React from 'react';
import memoize from 'lodash/memoize';

import createAsyncContext from './async-context';

const fetchConfig = memoize(
  async (url: string) => {
    const resp = await fetch(url);
    return await resp.json();
  }
);

/**
 * Create a callback that loads configuration optionally from a remote URL.
 *
 * @param config - Configuration object which may include `configFromURL`.
 * @returns Callback resolving to a frozen configuration object.
 */
export function useConfigLoader<T extends {configFromURL?: string}>(config: T) {
  return React.useCallback(
    async () => {
      let loadedConfig: Record<string, any>;
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

      const frozen = Object.freeze(loadedConfig);
      return frozen as Readonly<typeof loadedConfig>;
    },
    [config]
  );
}

export default createAsyncContext<Record<string, any>>({});
