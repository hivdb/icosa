/**
 * Type definitions for the PatternLoader component.
 * 
 * This file contains all TypeScript interfaces and types used by the
 * pattern-loader component for managing mutation patterns.
 */

/**
 * Represents a mutation pattern with a unique identifier, name, and list of mutations.
 */
export interface Pattern {
  uuid: string;
  name: string;
  mutations: string[];
}

/**
 * Represents the currently selected pattern with its index and name.
 */
export interface CurrentSelected {
  index: number;
  name: string;
}

/**
 * Props for the useCurrentSelected hook.
 */
export interface UseCurrentSelectedProps {
  lazyLoad: boolean;
  patterns: Pattern[];
}

/**
 * Props for the PatternLoader component.
 */
export interface PatternLoaderProps {
  /**
   * Render prop function that receives patterns, loading state, and current selection.
   */
  children: (args: {
    patterns: Pattern[];
    isPending: boolean;
    currentSelected: CurrentSelected;
  }) => React.ReactElement;
  
  /**
   * Additional props to pass through to the children render function.
   */
  childProps?: Record<string, unknown>;
  
  /**
   * Whether to lazy load patterns based on URL query parameters.
   */
  lazyLoad: boolean;
}
