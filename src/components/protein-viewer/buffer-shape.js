import React from 'react';
import PropTypes from 'prop-types';
import {useStage} from 'react-ngl';
import {Shape} from 'ngl';

const BufferShapeContext = React.createContext();


export function useBufferShape() {
  return React.useContext(BufferShapeContext);
}


BufferShape.propTypes = {
  children: PropTypes.node
};

export default function BufferShape({children}) {
  const stage = useStage();
  const shape = React.useMemo(
    () => new Shape('buffer-shape', {
      sphereDetail: 4,
      radialSegments: 100
    }),
    []
  );

  React.useEffect(
    () => {
      const shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation("buffer");
      return () => {
        stage.removeComponent(shapeComp);
        shape.dispose();
      };
    },
    [stage, shape]
  );

  return <BufferShapeContext.Provider value={shape}>
    {children}
  </BufferShapeContext.Provider>;
}
