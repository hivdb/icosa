import React from 'react';
import GenomeMap from '../../components/genome-map';
import PromiseComponent from '../../utils/promise-component';
import PresetSelection from './preset-selection';
import type {GenomeViewerProps, GenomeViewerLoaderProps} from './types';

/**
 * Renders a genome map with preset selection controls.
 *
 * @param options - available preset options
 * @param preset - preset configuration for the genome map
 */
function GenomeViewer({options, preset}: GenomeViewerProps) {
  return (
    <>
      <GenomeMap
        preset={preset}
        extraButtons={
          <>
            <PresetSelection as="div" options={options} />
          </>
        }
      />
    </>
  );
}

/**
 * Loads genome viewer preset data and renders the {@link GenomeViewer} component.
 *
 * @param presetLoader - async loader returning preset data
 */
function GenomeViewerLoader({presetLoader}: GenomeViewerLoaderProps) {
  const createPromise = React.useCallback(
    () =>
      (async () => {
        const {presets, ...preset} = await presetLoader();
        const options = presets.map(({name, label}) => ({value: name, label}));
        return {options, preset};
      })(),
    [presetLoader]
  );

  const [promise, setPromise] = React.useState(() => createPromise());

  React.useEffect(() => {
    setPromise(createPromise());
  }, [createPromise]);

  return (
    <>
      <PromiseComponent promise={promise} component={GenomeViewer} />
    </>
  );
}

export default GenomeViewerLoader;
