import React from 'react';

export default function useHoverResidues(sele, residues) {
  const [desc, setDesc] = React.useState();

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

  const onHover = React.useCallback(
    proxy => {
      const tooltip = tooltipRef.current;
      if (!tooltip) {
        return;
      }
      if (proxy && (proxy.atom || proxy.bond)) {
        const atom = proxy.atom || proxy.closestBondAtom;
        const mp = proxy.mouse.position;
        if (atom.resno in tooltipDesc) {
          const desc = tooltipDesc[atom.resno] || atom.qualifiedName();
          tooltip.style.bottom = window.innerHeight - mp.y + 3 + "px";
          tooltip.style.left = mp.x + 3 + "px";
          tooltip.style.display = "block";
          setDesc(desc);
        }
        else {
          tooltip.style.display = 'none';
        }
      } else {
        tooltip.style.display = "none";
      }
    },
    [tooltipDesc]
  );

  return {children: desc, onHover, tooltipRef};
}
