import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


export default class PaginatorItem extends React.Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    href: PropTypes.string,
    children: PropTypes.node.isRequired,
    currentSelected: PropTypes.string.isRequired,
    currentHovering: PropTypes.string,
    setCurrentHovering: PropTypes.func.isRequired
  }

  shouldComponentUpdate(nextProps) {
    const {props} = this;
    return !(
      nextProps.name === props.name &&
      nextProps.onClick === props.onClick &&
      nextProps.href === props.href &&
      nextProps.children === props.children &&
      nextProps.currentSelected === props.currentSelected &&
      nextProps.currentHovering === props.currentHovering &&
      nextProps.setCurrentHovering === props.setCurrentHovering
    );
  }

  handleMouseEnter = () => {
    const {name, setCurrentHovering} = this.props;
    setCurrentHovering(name);
  }

  handleMouseLeave = () => {
    const {setCurrentHovering} = this.props;
    setCurrentHovering(null);
  }

  render() {
    let {
      name, href, onClick, children,
      currentSelected, currentHovering
    } = this.props;

    return (
      <li
       onMouseEnter={this.handleMouseEnter}
       onMouseLeave={this.handleMouseLeave}
       className={style['paginator-item']}
       data-is-hovering={currentHovering === name}
       data-is-selected={currentSelected === name}>
        <a
         className={style['paginator-item_link']}
         href={href}
         onClick={onClick}>
          <span className={style['paginator-item_desc']}>
            {children}
          </span>
        </a>
      </li>
    );
  }

}
