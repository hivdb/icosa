import React from 'react';
import PropTypes from 'prop-types';

import style from './style.module.scss';


ExternalLink.propTypes = {
  children: PropTypes.node
};

export default function ExternalLink({children, ...props}) {
  return (
    <a
     target="_blank" rel="noopener noreferrer"
     {...props} className={style.link}>
      {children}
    </a>
  );
}
