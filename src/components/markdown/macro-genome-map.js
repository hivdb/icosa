import React from 'react';

import macroPlugin from './macro-plugin';
import GenomeMap from '../genome-map';

macroPlugin.addMacro('genomemap', (content, props) => {
  return {
    type: 'GenomeMapNode',
    mapName: content.trim(),
    props
  };
});


export default function GenomeMapNodeWrapper({genomeMaps}) {
  return ({mapName, props}) => {
    if (mapName in genomeMaps) {
      const preset = genomeMaps[mapName];
      return <GenomeMap {...props} preset={preset} />;
    }
    else {
      return <div>
        <strong>Error</strong>: genome-map data of {mapName} is not found.
      </div>;
    }
  };
}
