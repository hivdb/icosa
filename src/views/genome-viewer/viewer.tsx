import React from 'react';
import GenomeMap from '../../components/genome-map';
import PromiseComponent from '../../utils/promise-component';
import PresetSelection from './preset-selection';

/**
 * Visual domain on the genome map.
 */
interface Domain {
  posStart: number;
  posEnd: number;
  scaleRatio: number;
}

interface Position {
  name: string;
  pos: number;
  label?: string;
}

interface PositionGroup {
  name: string;
  label?: string;
  positions: Position[];
}

/**
 * Highlighted region within the genome map.
 */
interface Region {
  name: string;
  posStart: number;
  posEnd: number;
  shapeType: 'rect' | 'line' | 'wavy';
  label?: string;
  fill?: string;
  color?: string;
  offsetY?: number;
  wavyRepeats?: number;
  labelPosition?: 'above' | 'over' | 'below' | 'after';
}

interface CoverageEntry {
  position: number;
  coverage: number;
}

interface Coverage {
  height: number;
  posStart: number;
  posEnd: number;
  fill?: string;
  coverageUpperLimit?: number;
  coverages: CoverageEntry[];
}

interface PositionAxis {
  posOffset?: number;
  posStart?: number;
  posEnd?: number;
  convertToAA?: boolean;
  tickCount?: number;
  roundToNearest?: number;
}

/**
 * Configuration for a specific genome viewer preset.
 */
interface Preset {
  name: string;
  label: string;
  width: number;
  height: number;
  paddingTop: number;
  paddingRight: number;
  paddingLeft: number;
  domains: Domain[];
  hidePositionAxis?: boolean;
  positionAxis?: PositionAxis;
  positionGroups: PositionGroup[];
  positionExtendSize?: number;
  regions: Region[];
  coverages?: Coverage;
  footnote?: React.ReactNode;
}

interface Option {
  value: string;
  label: React.ReactNode;
}

/**
 * Properties for the {@link GenomeViewer} component.
 */
interface GenomeViewerProps {
  options: Option[];
  preset: Preset;
}

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

interface GenomeViewerLoaderProps {
  presetLoader: () => Promise<Preset & {presets: {name: string; label: React.ReactNode}[]}>;
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
