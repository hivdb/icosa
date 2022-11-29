import React from 'react';
import PropTypes from 'prop-types';

import ReferenceContext from './reference-context';


RefDefinition.propTypes = {
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

export default function RefDefinition({
  name,
  identifier,
  ...ref
}) {
  let myName = name || identifier;
  if (!myName) {
    const {authors, year} = ref;
    myName = `${authors.split(' ', 2)[0]}${year}`;
  }

  const {setReference} = React.useContext(ReferenceContext);

  React.useEffect(
    () => {
      setReference(myName, ref, /* incr= */false);
    },
    [setReference, myName, ref]
  );

  return <></>;
}
