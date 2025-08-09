import React from 'react';
import {Layer} from 'react-konva';

import PosAnnotGroup from './posannot-group';

interface AnnotsLayerProps {
  hoverUSAnnot: {annotName?: string};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
}

/**
 * Layer containing underscore annotation groups.
 */
export default function AnnotsLayer({hoverUSAnnot, config}: AnnotsLayerProps) {

  return React.useMemo(
    () => <Layer>
      <PosAnnotGroup {...{hoverUSAnnot, config}} />
    </Layer>,
    [hoverUSAnnot, config]
  );

}
