import React from 'react';

import macroPlugin from './macro-plugin';
import GenomeMap from '../genome-map';

macroPlugin.addMacro('genomemap', (content) => {
  return {
    type: 'GenomeMapNode',
    mapName: content.trim()
  };
});


export default function GenomeMapNodeWrapper({genomeMaps}) {
  return ({mapName}) => {
    if (mapName in genomeMaps) {
      const preset = genomeMaps[mapName];
      return <GenomeMap preset={preset} />;
    }
    else {
      return <div>
        <strong>Error</strong>: genome-map data of {mapName} is not found.
      </div>;
    }
  };
}
