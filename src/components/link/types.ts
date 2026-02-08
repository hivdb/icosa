/**
 * Type definitions for Link component.
 * 
 * Link provides a unified interface for internal (Found router) and external links.
 */

import type React from 'react';

/**
 * Props for Link component.
 * Supports both internal routing (via Found) and external links.
 * 
 * @param to - Internal route path or route object (uses Found router)
 * @param href - External URL (uses standard anchor tag)
 * @param onClick - Click handler
 * @param noDefaultStyle - If true, disables default link styling
 * @param children - Link content
 * @param className - Additional CSS classes
 * @param linkStyle - Predefined link style ('help' opens in new window)
 */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Internal route path or route object for Found router */
  to?: string | Record<string, unknown>;
  /** External URL for standard anchor tag */
  href?: string;
  /** Click event handler */
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** Disable default link styling */
  noDefaultStyle?: boolean;
  /** Link content */
  children?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Predefined link style (e.g., 'help' for help links) */
  linkStyle?: 'help';
}
