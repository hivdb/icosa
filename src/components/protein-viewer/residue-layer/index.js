import React from 'react';
import PropTypes from 'prop-types';
import {useComponent, useStage} from 'react-ngl';
import {Selection, TextBuffer, Shape} from 'ngl';
import {Color} from 'three';

import {residueAnnotShape} from '../prop-types';
import style from '../style.module.scss';

import useHoverResidues from './use-hover-residues';


ResidueLayer.propTypes = {
  sele: PropTypes.string,
  residues: PropTypes.arrayOf(
    residueAnnotShape.isRequired
  ).isRequired
};

export default function ResidueLayer({sele, residues}) {
  const stage = useStage();
  const component = useComponent();

  const {children, onHover, tooltipRef} = useHoverResidues(sele, residues);

  React.useEffect(
    () => {
      const hlAtom = residues.reduce(
        (acc, {resno, label, color}) => {
          acc[resno] = {label, color};
          return acc;
        },
        {}
      );
      const seleSuffix = sele ? `AND ${sele}` : '';
      const posSele = residues.map(({resno}) => resno).join(' OR ');

      const shape = new Shape('buffer-shape', {
        sphereDetail: 4,
        radialSegments: 100
      });
      for (const idx of component.object.getAtomIndices(
        new Selection(`(${posSele}) AND .CA ${seleSuffix}`)
      )) {
        const atom = component.object.getAtomProxy(idx);
        const {label, color} = hlAtom[atom.resno] || {};
        if (label) {
          const textBuffer = new TextBuffer({
            position: [atom.x, atom.y, atom.z],
            size: [3],
            color: new Color(color).toArray(),
            text: [label]
          }, {
            attachment: 'middle-center',
            zOffset: 2
          });
          shape.addBuffer(textBuffer);
        }
      }
      const shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation("buffer");
      return () => {
        stage.removeComponent(shapeComp);
        shape.dispose();
      };
    },
    [sele, stage, component, residues]
  );

  React.useEffect(
    () => {
      if (onHover) {
        stage.mouseControls.remove("hoverPick");
        stage.signals.hovered.add(onHover);
        return () => stage.signals.hovered.remove(onHover);
      }
    },
    [stage, onHover]
  );

  return (
    <div
     ref={tooltipRef}
     className={style.tooltip}>
      {children}
    </div>
  );
}
