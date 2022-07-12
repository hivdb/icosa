import React from 'react';

export default function useProcessors({
  config,
  match,
  subOptions,
  subOptionProcessors
}) {
  return React.useMemo(
    () => {
      const processors = [];
      const options = [...(config.formEnableTabularReportOptions || [])];
      if (
        options.length > 0 &&
        match.location.query?.legacyXML !== undefined
      ) {
        options.push('Raw XML report');
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
