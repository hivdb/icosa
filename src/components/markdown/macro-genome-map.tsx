import React from 'react';

import macroPlugin from './macro-plugin';
import GenomeMap from '../genome-map';

/**
 * Register the `genomemap` macro so markdown can render genome maps.
 * @param content - Macro content containing the name of the genome map.
 * @param props - Additional properties to pass to the GenomeMap component.
 * @returns A node descriptor consumed by the macro plugin.
 */
macroPlugin.addMacro('genomemap', (content: string, props: Record<string, unknown>) => {
  return {
    type: 'GenomeMapNode',
    mapName: content.trim(),
    props
  };
});

interface GenomeMapNodeWrapperProps {
  /** Mapping of genome map name to preset configuration. */
  genomeMaps: Record<string, unknown>;
}

interface GenomeMapNodeProps {
  /** Name of the genome map preset. */
  mapName: string;
  /** Arbitrary props passed from the markdown macro. */
  props: Record<string, unknown>;
}

/**
 * Wraps a genome map node returned from markdown macros.
 * It renders a GenomeMap component when the preset exists
 * otherwise an error message is shown.
 */
export default function GenomeMapNodeWrapper({genomeMaps}: GenomeMapNodeWrapperProps) {
  return ({mapName, props}: GenomeMapNodeProps) => {
    if (mapName in genomeMaps) {
      const preset = genomeMaps[mapName];
      return <GenomeMap {...props} preset={preset} />;
    }
    return <div>
      <strong>Error</strong>: genome-map data of {mapName} is not found.
    </div>;
  };
}

