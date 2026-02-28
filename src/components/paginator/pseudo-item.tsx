import React from 'react';
import type {PseudoItemProps} from './types';

export type {PseudoItemProps};

export default function PseudoItem(_props: PseudoItemProps): null {
  // This component does not render anything by itself; it serves as a
  // placeholder for paginator items which are processed by the parent
  // Paginator component.
  return null;
}
