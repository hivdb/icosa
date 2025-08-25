import * as React from 'react';
import { getRawProps } from './raw-store';

/**
 * Higher-order component that rehydrates complex macro props.
 *
 * Macro nodes travel through mdast → hast with a lightweight identifier
 * (`__rawId`) attached to `hProperties`. The full, potentially complex props
 * object is stored in an in-memory side-channel (see raw-store.ts) to avoid
 * string coercion of arrays, objects, or ReactNodes during the transformation.
 *
 * This decorator reads `props.__rawId`, retrieves the original props via
 * {@link getRawProps}, and merges them back into the props passed to the
 * wrapped component. Raw props take precedence over shallow values to ensure
 * integrity.
 *
 * @typeParam P - Component props type.
 * @param Comp - The component that expects full macro props.
 * @returns A component that merges raw macro props at render time.
 */
export function withMacroRawProps<P>(Comp: React.ComponentType<P>): React.FC<P & { __rawId?: string }> {
  return function MacroRawPropsWrapper(props: P & { __rawId?: string }): React.ReactNode {
    const raw = getRawProps(props?.__rawId) || {};
    const merged = { ...props, ...raw } as React.JSX.IntrinsicAttributes & P;
    return <Comp {...merged} />;
  };
}

export default withMacroRawProps;
