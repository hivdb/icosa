import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';

BasicLink.propTypes = {
  children: PropTypes.node
};

export default function BasicLink({children, ...props}) {
  return (
    <a {...props} className={style.link}>
      {children}
    </a>
  );
}
