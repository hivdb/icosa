import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './style.module.scss';


Loader.propTypes = {
  inline: PropTypes.bool,
  modal: PropTypes.bool,
  className: PropTypes.string
};

Loader.defaultProps = {
  inline: false,
  modal: false
};

export default function Loader({inline, modal, className}) {
  return <div className={classNames(
    style["lds-ring"],
    !modal && inline ? style['lds-ring-inline'] : null,
    modal ? style['lds-ring-modal'] : null,
    className
  )}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>;
}
