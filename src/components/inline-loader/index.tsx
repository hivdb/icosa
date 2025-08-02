import React from 'react';

import Loader from '../loader';

export default function InlineLoader(
  props: React.ComponentProps<typeof Loader>
) {
  return <Loader {...props} inline />;
}

