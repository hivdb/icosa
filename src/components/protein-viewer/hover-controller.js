import React from 'react';
import PropTypes from 'prop-types';
import {useStage} from 'react-ngl';


import {residueAnnotShape} from './prop-types';
import useHoverResidues from './use-hover-residues';
import style from './style.module.scss';


HoverController.propTypes = {
  hoverableResidues: PropTypes.arrayOf(
    residueAnnotShape.isRequired
  ).isRequired
};

export default function HoverController({hoverableResidues: residues}) {
  const stage = useStage();
  const {onHover, tooltipRef} = useHoverResidues(residues);

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
     className={style.tooltip} />
  );
}
