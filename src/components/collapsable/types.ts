import type React from 'react';
import type {Match, Router} from 'found';

/**
 * Heading level types for collapsable sections.
 */
export type HeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

/**
 * Result of finding the closest collapsable anchor.
 */
export interface ClosestAnchorResult {
  anchor: string | null;
  shouldCollapseOther: boolean;
}

/**
 * Function signature for registering a collapsable anchor.
 */
export type RegisterCollapsableAnchor = (
  anchor: string | null,
  level: string,
  alwaysCollapsable?: boolean
) => void;

/**
 * Function signature for getting the closest collapsable anchor.
 */
export type GetClosestCollapsableAnchor = (
  hash: string | null
) => ClosestAnchorResult;


/**
 * Props for the main Collapsable component.
 */
export interface CollapsableProps {
  levels?: HeadingLevel[];
  children?: React.ReactNode;
}

/**
 * Props for the Section component (before withRouter injection).
 */
export interface SectionProps {
  level: number;
  children?: React.ReactNode | ((args: {onLoad: () => void}) => React.ReactNode);
  alwaysCollapsable?: boolean;
  [key: string]: unknown;
}

/**
 * Props for SectionInner (after withRouter injection).
 */
export interface SectionInnerProps extends SectionProps {
  match: Match;
  router: Router;
  registerCollapsableAnchor: RegisterCollapsableAnchor;
  getClosestCollapsableAnchor: GetClosestCollapsableAnchor;
}

/**
 * HTML section element props with data attributes.
 */
export interface SectionElementProps extends React.HTMLAttributes<HTMLElement> {
  'data-level': number;
  'data-expanded'?: string;
}
