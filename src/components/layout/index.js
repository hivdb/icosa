import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import '../../styles/globals.scss';
import style from './style.module.scss';

class LayoutInner extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired
  }

  static childContextTypes = {
    setContainerWidth: PropTypes.func
  }

  getChildContext() {
    return {
      setContainerWidth: this.setContainerWidth
    };
  }

  constructor() {
    super(...arguments);
    this.state = {containerWidth: null};
  }

  setContainerWidth = (width) => {
    if (width !== this.state.containerWidth) {
      this.setState({containerWidth: width});
    }
  }

  render() {
    let {className, children} = this.props;
    const {containerWidth} = this.state;
    const customStyle = {};
    if (containerWidth) {
      customStyle.maxWidth = containerWidth;
    }
    className = classNames(style['layout-container'], className);
    return (
      <div id="hivdb-layout">
        <div className={className} style={customStyle}>
          {children}
        </div>
      </div>
    );
  }
}

export default class Layout extends React.Component {

  render() {
    const {children, ...props} = this.props;

    return (
      <LayoutInner {...props}>{children}</LayoutInner>
    );
  }
}
