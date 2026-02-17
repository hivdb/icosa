/**
 * Type definitions for Loader component.
 *
 * Loader displays an animated loading spinner.
 */

/**
 * Props for Loader component.
 *
 * @param inline - If true, renders as inline loader (smaller, no centering)
 * @param modal - If true, renders as modal loader (centered overlay)
 * @param className - Additional CSS classes to apply
 */
export interface LoaderProps {
  /** Render loader inline without centering */
  inline?: boolean;
  /** Render loader as modal overlay */
  modal?: boolean;
  /** Additional CSS class names */
  className?: string;
}
