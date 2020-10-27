import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


export default class PaginatorArrow extends React.Component {

  static propTypes = {
    direction: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired
  }

  shouldComponentUpdate(nextProps) {
    const {props} = this;
    return !(
      nextProps.direction === props.direction &&
      nextProps.onClick === props.onClick
    );
  }

  handleClick = evt => {
    evt.preventDefault();
    const {direction, onClick} = this.props;
    onClick(direction);
  }

  render() {
    let {
      direction
    } = this.props;

    return (
      <a
       href={`#paginator-${direction > 0 ? 'next' : 'prev'}`}
       onClick={this.handleClick}
       className={style['paginator-arrow']}
       data-direction={direction}>
        <span className={style['paginator-arrow_desc']}>
          {direction > 0 ? 'Next' : 'Prev'}
        </span>
      </a>
    );
  }

}
