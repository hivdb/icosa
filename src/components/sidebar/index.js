import React from 'react';
import PropTypes from 'prop-types';
import Link from '../link';

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


ItemLink.propTypes = {
  href: PropTypes.string,
  to: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired
};

function ItemLink({
  href,
  to,
  className,
  onClick,
  children
}) {
  let title = children;

  return (
    <Link
     noDefaultStyle
     className={className}
     to={to}
     href={href}
     onClick={onClick}>
      <span title={title}>
        {children}
      </span>
    </Link>
  );
}

export function SidebarItem() { return null; }

Sidebar.propTypes = {
  title: PropTypes.node.isRequired,
  currentSelected: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default function Sidebar({
  title,
  currentSelected,
  children
}) {

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
