import React from 'react';
import PropTypes from 'prop-types';
import Children from 'react-children-utilities';
import Loader from '../loader';

import useAutoUpdate from './use-auto-update';
import ReferenceContext from './reference-context';
import buildRef from './build-ref';


function InlineRef({name, identifier, ...ref}) {
  const {
    getReference,
    setReference
  } = React.useContext(ReferenceContext);

  useAutoUpdate();

  let finalName = name || identifier;
  if (!finalName) {
    const {authors, year} = ref;
    if (authors) {
      finalName = `${authors.split(' ', 2)[0]}${year}`;
    }
    else {
      finalName = Children.onlyText(ref.children);
    }
  }

  React.useEffect(
    () => {
      setReference(finalName, ref, /* incr=*/ false);
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [finalName, setReference]
  );

  const storedRef = getReference(finalName);

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug(`Render <InlineRef ${finalName} />`);
  }

  if (storedRef) {
    return buildRef(storedRef);
  }
  else {
    return <Loader inline />;
  }
}

InlineRef.propTypes = {
  name: PropTypes.string,
  identifier: PropTypes.string,
  authors: PropTypes.string,
  year: PropTypes.string,
  title: PropTypes.string,
  journal: PropTypes.string,
  medlineId: PropTypes.string,
  url: PropTypes.string,
  children: PropTypes.node
};

export default InlineRef;
