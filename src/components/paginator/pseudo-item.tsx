import React from 'react';

export interface PseudoItemProps {
  name: string;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}

export default function PseudoItem(_props: PseudoItemProps): null {
  // This component does not render anything by itself; it serves as a
  // placeholder for paginator items which are processed by the parent
  // Paginator component.
  return null;
}
