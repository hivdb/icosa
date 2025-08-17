import React, {ReactNode, useContext, useEffect, useMemo} from 'react';
import {useStage} from 'react-ngl';
import { Shape } from 'ngl';

/** Context carrying the NGL Shape used for temporary buffers */
const BufferShapeContext = React.createContext<any>(undefined);

/**
 * Access the shared NGL {@link Shape} for buffer drawings.
 *
 * @returns NGL Shape used for buffer representations or undefined when not mounted.
 */
export function useBufferShape(): any {
  return useContext(BufferShapeContext);
}

/** Props for {@link BufferShape} */
interface BufferShapeProps {
  /** Child elements that may draw buffers using the provided Shape */
  children?: ReactNode;
}

/**
 * Provider component that instantiates an NGL {@link Shape} and exposes it
 * via context so nested components can draw temporary buffer geometries.
 *
 * @param props - {@link BufferShapeProps}
 * @returns React component that renders children with Shape in context.
 */
export default function BufferShape({children}: BufferShapeProps) {
  const stage = useStage();
  const shape = useMemo(
    () => new Shape('buffer-shape', {
      sphereDetail: 4,
      radialSegments: 100
    }),
    []
  );

  useEffect(
    () => {
      const shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation('buffer');
      return () => {
        stage.removeComponent(shapeComp);
        shape.dispose();
      };
    },
    [stage, shape]
  );

  return (
    <BufferShapeContext.Provider value={shape}>
      {children}
    </BufferShapeContext.Provider>
  );
}

