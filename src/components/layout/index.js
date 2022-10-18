import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import '../../styles/globals.scss';
import style from './style.module.scss';

LayoutInner.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

function LayoutInner({className, children}) {
  return (
    <div id="hivdb-layout">
      <ul className={style['layout-header']}>
        <li>
          <a href="/">Home</a>
        </li>
      </ul>
      <div className={classNames(style['layout-container'], className)}>
        {children}
      </div>
    </div>
  );
}

export default class Layout extends React.Component {

  static propTypes = {
    children: PropTypes.node
  };

  render() {
    const {children, ...props} = this.props;

    return (
      <LayoutInner {...props}>{children}</LayoutInner>
    );
  }
}
