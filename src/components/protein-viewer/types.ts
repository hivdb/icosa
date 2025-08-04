import type {Position, Rotation} from 'react-ngl';
import type {ReactNode} from 'react';

/** Annotation for a residue within a structure */
export interface ResidueAnnot {
  /** Residue number */
  resno: number;
  /** Display label for the residue */
  label?: string;
  /** Tooltip description */
  desc?: string;
  /** Background color as string or numeric value */
  bgColor: string | number;
  /** Text color as string or numeric value */
  color: string | number;
}

/** Annotation tied to a position in the structure */
export interface PositionAnnot {
  /** Residue position */
  position: number;
  /** Display label for the position */
  label?: string;
  /** Tooltip description */
  desc?: string;
  /** Background color */
  bgColor: string | number;
  /** Text color */
  color: string | number;
}

/** Camera state describing view in NGL */
export interface CameraState {
  /** Camera position vector */
  position?: Position | number[] | object;
  /** Camera rotation quaternion */
  rotation?: Rotation | number[] | object;
  /** Camera distance */
  distance?: number;
}

/** Definition of a structural view */
export interface View {
  /** Unique view name */
  name: string;
  /** RCSB PDB identifier */
  pdb: string;
  /** Optional label for UI */
  label?: ReactNode;
  /** Optional selection string */
  sele?: string;
  /** Offset to add to positions */
  positionOffset?: number;
  /** Default camera state for this view */
  defaultCameraState?: CameraState;
}

