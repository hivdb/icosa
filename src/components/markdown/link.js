import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';


function getTarget(href, props) {
  let {target} = props;
  if (target) {
    return target;
  }
  if (/^(https?:\/\/|\/\/)/gi.test(href)) {
    return '_blank';
  }
  return null;
}

function renderLink(href, props) {
  const {children, ...others} = props;
  const target = getTarget(href, props);
  if (!href.startsWith('#') && target == null) {
    return <Link to={href} {...props} />;
  }
  else {
    return (
      <a
       href={href}
       {...others}
       rel="noopener noreferrer"
       target={target}>
        {children}
      </a>
    );
  }
}

function MarkdownLink({href, ...props}) {
  let type = 'link';
  if (href.startsWith('!')) {
    [type, href] = href.split(/:/);
    type = type.slice(1);
    href = href ? href.trim() : href;
  }
  switch (type) {
    // case 'gist':
    //   return this.renderGist(href, props);
    case 'link':
    default:
      return renderLink(href, props);
  }
}

MarkdownLink.propTypes = {
  href: PropTypes.string.isRequired
};

export default MarkdownLink;
