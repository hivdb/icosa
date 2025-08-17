import React from 'react';
import Loader from '../loader';

export default function FixedLoader(
  props: React.ComponentProps<typeof Loader>
) {
  return <Loader {...props} modal />;
}

