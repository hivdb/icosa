import React from 'react';

export default function useProcessors({
  config,
  subOptions,
  subOptionProcessors
}) {
  return React.useMemo(
    () => {
      const processors = [];
      for (const opt of config.formEnableTabularReportOptions || []) {
        const idx = subOptions.indexOf(opt);
        if (idx > -1) {
          processors.push(subOptionProcessors[idx]);
        }
      }
      return processors;
    },
    [config.formEnableTabularReportOptions, subOptionProcessors, subOptions]
  );
}
