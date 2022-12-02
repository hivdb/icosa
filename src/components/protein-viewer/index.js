import React from 'react';
import PropTypes from 'prop-types';
import {
  Stage,
  Component,
  Position,
  Rotation,
  useStage,
  useComponent
} from 'react-ngl';
import * as NGL from 'ngl';

const COLORS = [
  0xe5f7d5,
  0xf7efd0,
  0xffedfe
];

const ResidueAnnotShape = PropTypes.shape({
  resno: PropTypes.number.isRequired,
  desc: PropTypes.string,
  color: PropTypes.string.isRequired
});

AutoView.propTypes = {
  residues: PropTypes.arrayOf(
    ResidueAnnotShape.isRequired
  ).isRequired
};

function AutoView({residues}) {
  const stage = useStage();
  const component = useComponent();
  const tooltipRef = React.useRef();
  const tooltipDesc = React.useMemo(
    () => residues.reduce(
      (acc, {resno, desc}) => {
        acc[resno] = desc || null;
        return acc;
      },
      {}
    ),
    [residues]
  );

  React.useEffect(
    () => {
      const tooltip = tooltipRef.current;
      stage.mouseControls.remove("hoverPick");
      stage.signals.hovered.add(proxy => {
        if (proxy && (proxy.atom || proxy.bond)) {
          /*
          const {canvasPosition: cp, picker} = proxy;
          const nearByAtoms = {};
          for (let i = 0; i < picker.array.length; i ++) {
            const atom = picker.getObject(i);
            if (atom.resno in tooltipDesc) {
              nearByAtoms[atom.resno] = cp.distanceTo(atom);
            }
          }*/
          const atom = proxy.atom || proxy.closestBondAtom;
          /*if (Object.keys(nearByAtoms).length > 0) {
            console.log(
              Object.entries(nearByAtoms).reduce(
                (acc, cur) => cur[1] < acc[1] ? cur : acc,
                [-1, Number.POSITIVE_INFINITY]
              ),
              [atom.resno, cp.distanceTo(atom)],
              nearByAtoms
            );
          }*/
          const mp = proxy.mouse.position;
          if (atom.resno in tooltipDesc) {
            const desc = tooltipDesc[atom.resno] || atom.qualifiedName();
            const chainName = atom.chainname;
            tooltip.innerText = `${desc} (Chain ${chainName})`;
            tooltip.style.bottom = window.innerHeight - mp.y + 3 + "px";
            tooltip.style.left = mp.x + 3 + "px";
            tooltip.style.display = "block";
          }
          else {
            tooltip.style.display = 'none';
          }
        } else {
          tooltip.style.display = "none";
        }
      });
    },
    [stage, tooltipDesc]
  );

  React.useEffect(
    () => {
      component.autoView();
    },
    [component]
  );

  return <>
    <div
     ref={tooltipRef}
     style={{
       display: "none",
       position: "fixed",
       zIndex: 10,
       pointerEvents: "none",
       backgroundColor: "rgba( 0, 0, 0, 0.6 )",
       color: "lightgrey",
       padding: "8px",
       fontFamily: "sans-serif"
     }} />
  </>;
}


ProteinViewer.propTypes = {
  residues: PropTypes.arrayOf(
    ResidueAnnotShape.isRequired
  ).isRequired,
  pdb: PropTypes.string.isRequired
};

export default function ProteinViewer({residues, pdb}) {
  const [cameraState, setCameraState] = React.useState(/*{
    position: new Position(-200, -200, -200),
    rotation: new Rotation(0, 0, 0, 0),
    distance: -300
  }*/);
  // console.log(cameraState);

  const reprList = React.useMemo(() => {
    const hlAtom = residues.reduce(
      (acc, {resno, color}) => {
        acc[resno] = color;
        return acc;
      },
      {}
    );
    const schemeId = NGL.ColormakerRegistry.addScheme(
      function() {
        this.atomColor = atom => {
          if (atom.resno in hlAtom) {
            return hlAtom[atom.resno];
          }
          else if (atom.chainIndex in COLORS) {
            return COLORS[atom.chainIndex];
          }
          else {
            return 0xffffff;
          }
        };
      }
    );
    return [{
      type: 'spacefill',
      params: {color: schemeId}
    }];
  }, [residues]);

  return (
    <Stage
     width={600}
     height={600}
     params={{
       backgroundColor: '#fff'
     }}
     cameraState={cameraState}
     onCameraMove={setCameraState}>
      <Component path={`rcsb://${pdb}`} reprList={reprList}>
        <AutoView residues={residues} />
      </Component>
    </Stage>
  );
}
