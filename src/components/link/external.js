import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import style from './style.module.scss';


ExternalLink.propTypes = {
  noDefaultStyle: PropTypes.bool.isRequired,
  className: PropTypes.string,
  children: PropTypes.node
};

ExternalLink.defaultProps = {
  noDefaultStyle: false
};

export default function ExternalLink({
  children,
  className,
  noDefaultStyle,
  ...props
}) {
  return (
    <a
     target="_blank"
     rel="noopener noreferrer"
     {...props}
     className={classNames(
       noDefaultStyle ? null : style.link,
       className
     )}>
      {children}
    </a>
  );
}
