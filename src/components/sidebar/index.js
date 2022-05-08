import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


let _isPositionStickySupported;

function isPositionStickySupported() {
  if (window.__SERVER_RENDERING) {
    return true;
  }
  if (typeof _isPositionStickySupported === 'undefined') {
    const elem = document.createElement('div');
    _isPositionStickySupported = true;
    elem.style.position = 'sticky';
    if (elem.style.position === 'sticky') {
      return true;
    }
    elem.style.position = '-webkit-sticky';
    if (elem.style.position === '-webkit-sticky') {
      return true;
    }
    _isPositionStickySupported = false;
  }
  return _isPositionStickySupported;
}


class ItemLink extends React.Component {

  static propTypes = {
    children: PropTypes.node.isRequired
  };

  constructor() {
    super(...arguments);
    this.state = {
      addStyle: {}/*,
      keyframe: null,
      animeSec: 2*/
    };
    this._transitions = [];
  }

  render() {
    const {href, children, className, onClick} = this.props;
    const {addStyle/*, keyframe, animeSec*/} = this.state;
    let title = children;

    return (
      <a
       className={className}
       href={href}
       onClick={onClick}
       style={addStyle}>
        <span title={title}>
          {children}
        </span>
      </a>
    );
  }
}

export class SidebarItem extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    href: PropTypes.string,
    children: PropTypes.node.isRequired
  };

  render() {
    return null;
  }

}


export default class Sidebar extends React.Component {

  static propTypes = {
    title: PropTypes.node.isRequired,
    currentSelected: PropTypes.string,
    children: PropTypes.node.isRequired
  };

  render() {
    let {currentSelected, title, children} = this.props;
    if (!(children instanceof Array)) {
      children = [children];
    }

    return <div className={
      isPositionStickySupported() ?
        style['sidebar-sticky-container'] :
        style['sidebar-fixed-container']
    }>
      <div className={style['sidebar-container']}>
        <nav className={style['sidebar-general']}>
          <div className={style['sidebar-title']}>{title}</div>
          <ul>
            {children
              .map((item, idx) => (
                <li key={idx}>
                  <ItemLink
                   key={idx}
                   className={
                      item.props.name === currentSelected ?
                        style.current : null
                    }
                   to={item.props.to}
                   href={item.props.href}
                   onClick={item.props.onClick}>
                    {item.props.children}
                  </ItemLink>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </div>;
  }

}
