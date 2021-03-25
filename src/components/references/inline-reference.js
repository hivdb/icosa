import React from 'react';
import PropTypes from 'prop-types';
import Children from 'react-children-utilities';
import InlineLoader from '../inline-loader';

import ReferenceContext from './reference-context';
import buildRef from './build-ref';


function InlineRef({name, identifier, ...ref}) {
  name = name || identifier;
  if (!name) {
    const {authors, year} = ref;
    if (authors) {
      name = `${authors.split(' ', 2)[0]}${year}`;
    }
    else {
      name = Children.onlyText(ref.children);
    }
  }

  return <ReferenceContext.Consumer>
    {({setReference, getReference, ensureLoaded}) => {
      setReference(
        name, ref, /* incr=*/ false
      );

      return ensureLoaded(
        () => buildRef(getReference(name)),
        <InlineLoader />
      );
    }}
  </ReferenceContext.Consumer>;
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
