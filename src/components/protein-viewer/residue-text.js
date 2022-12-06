import React from 'react';
import PropTypes from 'prop-types';
import {useComponent, useStage} from 'react-ngl';
import {Shape, Selection, TextBuffer} from 'ngl';
import {Color} from 'three';

import {residueAnnotShape} from './prop-types';


ResidueText.propTypes = {
  sele: PropTypes.string,
  residues: PropTypes.arrayOf(
    residueAnnotShape.isRequired
  ).isRequired
};

export default function ResidueText({sele, residues}) {
  const stage = useStage();
  const component = useComponent();

  React.useEffect(
    () => {
      const hlAtom = residues.reduce(
        (acc, {resno, desc, color}) => {
          acc[resno] = {desc, color};
          return acc;
        },
        {}
      );
      const seleSuffix = sele ? `AND ${sele}` : '';
      const shape = new Shape('residue-text', {
        sphereDetail: 4,
        radialSegments: 100
      });
      const posSele = residues.map(({resno}) => resno).join(' OR ');
      for (const idx of component.object.getAtomIndices(
        new Selection(`(${posSele}) AND .CA ${seleSuffix}`)
      )) {
        const atom = component.object.getAtomProxy(idx);
        const {desc, color} = hlAtom[atom.resno] || {};
        if (desc) {
          const textBuffer = new TextBuffer({
            position: [atom.x, atom.y, atom.z],
            size: [3],
            color: new Color(color).toArray(),
            text: [desc]
          }, {
            attachment: 'middle-center',
            zOffset: 2
          });
          shape.addBuffer(textBuffer);
        }
      }
      const shapeComp = stage.addComponentFromObject(shape);
      shapeComp.addRepresentation("buffer");
      return () => stage.removeComponent(shapeComp);
    },
    [sele, stage, component, residues]
  );

  return <></>;
}
