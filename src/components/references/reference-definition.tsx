import React from 'react';

import ReferenceContext from './reference-context';

export interface RefDefinitionProps {
  name?: string;
  identifier?: string;
  authors?: string;
  year?: string;
  title?: string;
  journal?: string;
  medlineId?: string;
  url?: string;
  children?: React.ReactNode;
}

/**
 * Registers a reference definition with the {@link ReferenceContext}.
 * The component itself renders nothing.
 */
export default function RefDefinition({
  name,
  identifier,
  ...ref
}: RefDefinitionProps): JSX.Element {
  let myName = name || identifier;
  if (!myName) {
    const { authors, year } = ref;
    myName = `${authors?.split(' ', 2)[0]}${year}`;
  }

  const { setReference } = React.useContext(ReferenceContext as any);

  React.useEffect(() => {
    setReference(myName, ref, /* incr= */ false);
  }, [myName, ref, setReference]);

  return <></>;
}
