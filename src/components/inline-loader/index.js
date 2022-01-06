import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './style.module.scss';


InlineLoader.propTypes = {
  className: PropTypes.string
};

export default function InlineLoader({className}) {
  return <div className={classNames(style["lds-ring"], className)}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>;
}
