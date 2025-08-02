import React from 'react';
import Link from '../link';

import style from './style.module.scss';

let _isPositionStickySupported: boolean | undefined;

function isPositionStickySupported() {
  if ((window as any).__SERVER_RENDERING) {
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

interface ItemLinkProps {
  href?: string;
  to?: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

function ItemLink({
  href,
  to,
  className,
  onClick,
  children
}: ItemLinkProps) {
  const title = children as any;
  return (
    <Link
      noDefaultStyle
      className={className}
      to={to}
      href={href}
      onClick={onClick}>
      <span title={title as string}>
        {children}
      </span>
    </Link>
  );
}

export function SidebarItem() { return null; }

interface SidebarProps {
  title: React.ReactNode;
  currentSelected?: string;
  children: React.ReactNode;
}

export default function Sidebar({
  title,
  currentSelected,
  children
}: SidebarProps) {
  const items = Array.isArray(children) ? children : [children];
  return <div className={
    isPositionStickySupported() ?
      style['sidebar-sticky-container'] :
      style['sidebar-fixed-container']
  }>
    <div className={style['sidebar-container']}>
      <nav className={style['sidebar-general']}>
        <div className={style['sidebar-title']}>{title}</div>
        <ul>
          {items.map((item: any, idx: number) => (
            <li key={idx}>
              <ItemLink
                className={item.props.name === currentSelected ? style.current : undefined}
                to={item.props.to}
                href={item.props.href}
                onClick={item.props.onClick}
              >
                {item.props.children}
              </ItemLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </div>;
}
