import React from 'react';
import PropTypes from 'prop-types';
import {Link as FoundLink} from 'found';

import style from './style.module.scss';


Link.propTypes = {
  children: PropTypes.node
};

export default function Link({children, ...props}) {
  return (
    <FoundLink
     {...props} className={style.link}>
      {children}
    </FoundLink>
  );
}
