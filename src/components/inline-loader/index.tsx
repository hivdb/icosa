import React from 'react';
import Loader from '../loader';

/**
 * Inline variant of the {@link Loader} component.
 *
 * @param props - Props forwarded to {@link Loader}.
 * @returns Loader rendered inline.
 */
export default function InlineLoader(props: React.ComponentProps<typeof Loader>) {
  return <Loader {...props} inline />;
}

