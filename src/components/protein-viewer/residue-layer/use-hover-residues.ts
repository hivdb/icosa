import React from 'react';
import type {ResidueAnnot} from '../types';

/**
 * Hook providing hover tooltip behaviour for residue annotations.
 *
 * @param sele - NGL selection string (unused but kept for API compatibility)
 * @param residues - Array of residue annotations with descriptions
 * @returns Tooltip content, hover handler and ref to tooltip element
 */
export default function useHoverResidues(sele: string | undefined, residues: ResidueAnnot[]) {
  const [desc, setDesc] = React.useState<string | undefined>();

  const tooltipRef = React.useRef<HTMLDivElement>(null);
  const tooltipDesc = React.useMemo(
    () => residues.reduce<Record<number, string | null>>(
      (acc, {resno, desc}) => {
        acc[resno] = desc || null;
        return acc;
      },
      {}
    ),
    [residues]
  );

  const onHover = React.useCallback(
    (proxy: any) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) {
        return;
      }
      if (proxy && (proxy.atom || proxy.bond)) {
        const atom = proxy.atom || proxy.closestBondAtom;
        const mp = proxy.mouse.position;
        if (atom.resno in tooltipDesc) {
          const desc = tooltipDesc[atom.resno] || atom.qualifiedName();
          tooltip.style.bottom = window.innerHeight - mp.y + 3 + 'px';
          tooltip.style.left = mp.x + 3 + 'px';
          tooltip.style.display = 'block';
          setDesc(desc);
        }
        else {
          tooltip.style.display = 'none';
        }
      } else {
        tooltip.style.display = 'none';
      }
    },
    [tooltipDesc]
  );

  return {children: desc, onHover, tooltipRef};
}

