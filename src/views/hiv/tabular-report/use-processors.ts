import React from 'react';

export interface UseProcessorsParams {
  /** configuration object */
  config: any;
  /** routing match info */
  match: any;
  /** available option labels */
  subOptions: string[];
  /** processors corresponding to options */
  subOptionProcessors: any[];
}

/**
 * Determine which report processors should be executed based on the
 * current configuration and routing information.
 *
 * @param params - {@link UseProcessorsParams} controlling selection logic.
 * @returns An array of processors to be invoked.
 */
export default function useProcessors({
  config,
  match,
  subOptions,
  subOptionProcessors
}: UseProcessorsParams) {
  return React.useMemo(
    () => {
      const processors: any[] = [];
      const options = [...(config.formEnableTabularReportOptions || [])];
      if (
        options.length > 0 &&
        match.location.query?.legacyXML !== undefined
      ) {
          options.push('Raw XML report (deprecated)');
      }
      for (const opt of options) {
        const idx = subOptions.indexOf(opt);
        if (idx > -1) {
          processors.push(subOptionProcessors[idx]);
        }
      }
      return processors;
    },
    [
      config.formEnableTabularReportOptions,
      match.location.query?.legacyXML,
      subOptionProcessors,
      subOptions
    ]
  );
}
