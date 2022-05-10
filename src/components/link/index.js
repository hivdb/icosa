import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {Link as FoundLink} from 'found';

import style from './style.module.scss';


Link.propTypes = {
  to: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.object.isRequired
  ]),
  href: PropTypes.string,
  noDefaultStyle: PropTypes.bool.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  linkStyle: PropTypes.oneOf(['help'])
};

Link.defaultProps = {
  noDefaultStyle: false
};

export default function Link({
  to,
  children,
  linkStyle,
  className,
  noDefaultStyle,
  ...props
}) {

  const openInNewWindow = React.useCallback(
    e => {
      e && e.preventDefault();
      window.open(
        props.to,
        '_sierra-help-window',
        'width=960,height=700,resizable,scrollbars=yes,' +
        'menubar=no,toolbar=no,personalbar=no,status=no'
      );
    },
    [props.to]
  );

  if (linkStyle) {
    className = classNames(
      noDefaultStyle ? null : style[`${linkStyle}-link`],
      className
    );
  }
  className = classNames(noDefaultStyle ? null : style.link, className);
  const component = to ? FoundLink : 'a';
  return React.createElement(
    component,
    {
      ...props,
      to,
      className,
      onClick: linkStyle === 'help' ? openInNewWindow : undefined
    },
    children
  );
}
