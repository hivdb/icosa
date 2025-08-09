import React from 'react';
import {Link} from 'found';

interface MarkdownLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
}

type LinkProps = Omit<MarkdownLinkProps, 'href'>;

/**
 * Determine the target attribute for a link.
 *
 * @param href - Link destination.
 * @param props - Remaining anchor properties.
 * @returns Target string or `undefined` when not needed.
 */
function getTarget(href: string, props: LinkProps): string | undefined {
  const {target} = props;
  if (target) {
    return target;
  }
  if (/^(https?:\/\/|\/\/)/gi.test(href)) {
    return '_blank';
  }
  return undefined;
}

/**
 * Render either a router-aware link or a plain anchor element.
 */
function renderLink(href: string, props: LinkProps) {
  const {children, ...others} = props;
  const target = getTarget(href, props);
  if (!href.startsWith('#') && target === undefined) {
    return (
      <Link to={href} {...(others as any)}>
        {children}
      </Link>
    );
  }
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

/**
 * Interpret special link syntaxes and render the appropriate element.
 */
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
