import React from 'react';
import PropTypes from 'prop-types';
import {Layer} from 'react-konva';

import PosAnnotGroup from './posannot-group';


AnnotsLayer.propTypes = {
  hoverUSAnnot: PropTypes.shape({
    annotName: PropTypes.string
  }).isRequired,
  config: PropTypes.object.isRequired
};


export default function AnnotsLayer({hoverUSAnnot, config}) {

  return React.useMemo(
    () => <Layer>
      <PosAnnotGroup {...{hoverUSAnnot, config}} />
    </Layer>,
    [hoverUSAnnot, config]
  );

}
