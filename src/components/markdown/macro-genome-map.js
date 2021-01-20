import React from 'react';

import macroPlugin from './macro-plugin';
import GenomeMap from '../genome-map';

macroPlugin.addMacro('genomemap', (content) => {
  return {
    type: 'GenomeMapNode',
    preset: JSON.parse(content.trim())
  };
});


export default function GenomeMapNode({preset}) {
  return <GenomeMap preset={preset} />;
}
