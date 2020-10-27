import React from 'react';
import PropTypes from 'prop-types';


export default class PseudoItem extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    href: PropTypes.string,
    children: PropTypes.node.isRequired
  }

  render() {
    return null;
  }

}
