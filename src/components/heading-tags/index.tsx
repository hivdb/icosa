import React from 'react';
import classNames from 'classnames';
import {FaLink} from '@react-icons/all-files/fa/FaLink';
import Children from 'react-children-utilities';
import type {HeadingTagProps, HeadingTagWrapperProps} from './types';

import style from './style.module.scss';

export type {HeadingTagProps, HeadingTagWrapperProps} from './types';

/**
 * Extract all text content from a React node.
 *
 * @param elem - Node whose textual children should be concatenated.
 * @returns Plain text representation of the node.
 */
export function getChildrenText(elem: React.ReactNode): string {
  return Children.onlyText(elem);
}

/**
 * Generate a stable anchor string for a heading element.
 *
 * When a {@link HeadingTag} element is provided, the function derives the
 * anchor from its children; otherwise the provided node is used directly.
 *
 * @param elem - A heading element or node to derive the anchor from.
 * @returns Sanitised anchor text.
 */
export function getAnchor(elem: React.ReactElement | React.ReactNode): string {
  if ((elem as React.ReactElement).type === HeadingTag) {
    elem = (elem as React.ReactElement<{children?: React.ReactNode}>).props.children;
  }
  return getChildrenText(elem)
    .toLowerCase()
    .replace(/[^\w-]+/g, '.');
}

/**
 * Render a heading element with an optional self-referential anchor link.
 *
 * @param props - {@link HeadingTagProps} controlling appearance and behaviour.
 * @returns Rendered heading element.
 */
export function HeadingTag({
  id,
  level,
  className,
  children,
  disableAnchor = false,
  ...props
}: HeadingTagProps) {

  const elemRef = React.useRef<HTMLHeadingElement>(null);

  const anchor = React.useMemo(
    () => id ? id : getAnchor(children),
    [id, children]
  );

  React.useEffect(
    () => {
      if (anchor !== '' && window.location.hash.replace(/^#/, '') === anchor) {
        setTimeout(() => {
          if (elemRef.current) {
            const top = (
              elemRef.current.getBoundingClientRect().top + window.pageYOffset
            );
            window.scrollTo(0, top);
          }
        });
      }
    },
    [anchor]
  );

  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <Tag
      {...props}
      ref={elemRef}
      className={classNames(className, style['heading-tag'])}
      id={anchor}
    >
      {disableAnchor ? null : (
        <a
          href={`#${anchor}`}
          className={style['anchor-link']}
          data-anchor-link=""
        >
          <FaLink name="linkify" />
        </a>
      )}
      {children}
    </Tag>
  );

}

export function H1(props: HeadingTagWrapperProps) {
  return <HeadingTag {...props} level={1} />;
}

export function H2(props: HeadingTagWrapperProps) {
  return <HeadingTag {...props} level={2} />;
}

export function H3(props: HeadingTagWrapperProps) {
  return <HeadingTag {...props} level={3} />;
}

export function H4(props: HeadingTagWrapperProps) {
  return <HeadingTag {...props} level={4} />;
}

export function H5(props: HeadingTagWrapperProps) {
  return <HeadingTag {...props} level={5} />;
}

export function H6(props: HeadingTagWrapperProps) {
  return <HeadingTag {...props} level={6} />;
}
