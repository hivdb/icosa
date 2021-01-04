import React from 'react';
import PropTypes from 'prop-types';

import ReferenceContext from './reference-context';


export default class RefDefinition extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    identifier: PropTypes.string,
    authors: PropTypes.string,
    year: PropTypes.string,
    title: PropTypes.string,
    journal: PropTypes.string,
    medlineId: PropTypes.string,
    url: PropTypes.string,
    children: PropTypes.node
  }

  render() {
    let {name, identifier, ...ref} = this.props;
    name = name || identifier;
    if (!name) {
      const {authors, year} = ref;
      name = `${authors.split(' ', 2)[0]}${year}`;
    }

    return <ReferenceContext.Consumer>
      {({setReference}) => {
        setReference(name, ref, /* noIncr= */true);
        return null;
      }}
    </ReferenceContext.Consumer>;
  }

}
