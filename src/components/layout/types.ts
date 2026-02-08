/**
 * Type definitions for Layout component.
 * 
 * Layout provides the main page structure with header and content area.
 */

import type React from 'react';

/**
 * Props for Layout component.
 * 
 * @param className - Additional CSS class for the layout container
 * @param children - Page content to render within the layout
 */
export interface LayoutProps {
  /** Additional CSS class name for the layout container */
  className?: string;
  /** Page content */
  children?: React.ReactNode;
}
