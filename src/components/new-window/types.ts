/**
 * Type definitions for the new-window component.
 *
 * This component manages popup windows for rendering components in separate browser windows,
 * with bidirectional communication between parent and child windows.
 */

/**
 * Props for the NewWindowPropsProvider internal component.
 *
 * @internal
 */
export interface NewWindowPropsProviderProps {
  /** Props passed from the route */
  routeProps: Record<string, any>;
  /** Optional props to override route props */
  overrideProps?: Record<string, any>;
  /** Component to render in the new window */
  Component: React.ComponentType<any>;
}

/**
 * Props for the NewWindowRoute component.
 */
export interface NewWindowRouteProps {
  /** Optional prefix used to build the popup path. */
  pathPrefix?: string;
  /** Props injected into the rendered component inside the popup. */
  overrideProps?: Record<string, any>;
  /** Component rendered within the new window route. */
  Component: React.ComponentType<any>;
  /** Additional route props */
  [key: string]: any;
}

/**
 * Options for the useNewWindow hook.
 */
export interface UseNewWindowOptions {
  /** Name identifier for the popup window */
  name: string;
  /** Callback invoked when the popup window is closed */
  onUnload?: () => void;
  /** Window features string (e.g., 'width=800,height=600') */
  features?: string;
}

/**
 * Return value from the useNewWindow hook.
 */
export interface UseNewWindowResult {
  /** True if this is the parent/opener window */
  isOpener: boolean;
  /** True if this is the child/popup window */
  isChild: boolean;
}
