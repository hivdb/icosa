import React from 'react';
import Children from 'react-children-utilities';
import Loader from '../loader';

import useAutoUpdate from './use-auto-update';
import ReferenceContext from './reference-context';
import buildRef from './build-ref';

export interface InlineRefProps {
  name?: string;
  identifier?: string;
  authors?: string;
  year?: string;
  title?: string;
  journal?: string;
  medlineId?: string;
  url?: string;
  children?: React.ReactNode;
  group?: string;
}

/**
 * Renders an inline reference. The component registers the reference with
 * the {@link ReferenceContext} and displays either a loader or the formatted
 * reference once it becomes available.
 */
export default function InlineRef({ name, identifier, ...ref }: InlineRefProps) {
  const reference = React.useContext(ReferenceContext);
  if (!reference) {
    return null;
  }
  const { getReference, setReference } = reference;

  useAutoUpdate();

  let finalName = name || identifier;
  if (!finalName) {
    const { authors, year } = ref;
    if (authors) {
      finalName = `${authors.split(' ', 2)[0]}${year}`;
    } else {
      finalName = Children.onlyText(ref.children);
    }
  }

  React.useEffect(() => {
    setReference(finalName!, ref, /* incr= */ false);
  }, [finalName, ref, setReference]);

  const storedRef = getReference(finalName!);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`Render <InlineRef ${finalName} />`);
  }

  if (storedRef) {
    return <>{buildRef(storedRef)}</>;
  } else {
    return <Loader inline />;
  }
}
