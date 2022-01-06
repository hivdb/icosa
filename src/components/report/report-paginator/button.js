import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.node
};

export default function Button({
  onClick,
  children
}) {
  return (
    <button
     className={style['navbar-button']}
     onClick={onClick}>
      {children}
    </button>
  );
}
