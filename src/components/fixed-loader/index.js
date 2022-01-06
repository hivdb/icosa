import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './style.module.scss';


FixedLoader.propTypes = {
  className: PropTypes.string
};

export default function FixedLoader({className}) {
  return <div className={classNames(style["lds-ring_fixed"], className)}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>;
}
