import React from 'react';
import {Link} from 'found';

interface MarkdownLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
}

function getTarget(href: string, props: MarkdownLinkProps): string | null {
  const {target} = props;
  if (target) {
    return target;
  }
  if (/^(https?:\/\/|\/\/)/gi.test(href)) {
    return '_blank';
  }
  return null;
}

function renderLink(href: string, props: MarkdownLinkProps) {
  const {children, ...others} = props;
  const target = getTarget(href, props);
  if (!href.startsWith('#') && target == null) {
    return <Link to={href} {...(props as React.ComponentProps<typeof Link>)} />;
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

export default function MarkdownLink({href, ...props}: MarkdownLinkProps) {
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
