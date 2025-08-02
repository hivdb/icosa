import classNames from 'classnames';
import React from 'react';
import {FaLink} from '@react-icons/all-files/fa/FaLink';
import Children from 'react-children-utilities';

import style from './style.module.scss';


export function getChildrenText(elem: React.ReactNode): string {
  return Children.onlyText(elem);
}


export function getAnchor(elem: React.ReactElement | React.ReactNode): string {
  if (React.isValidElement(elem) && elem.type === HeadingTag) {
    elem = elem.props.children;
  }
  return getChildrenText(elem)
    .toLowerCase()
    .replace(/[^\w-]+/g, '.');
}
export interface HeadingTagProps extends React.HTMLAttributes<HTMLHeadingElement> {
  id?: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  children: React.ReactNode;
  disableAnchor?: boolean;
}

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

    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag
     {...props}
     ref={elemRef}
     className={classNames(className, style['heading-tag'])}
     id={anchor}>
      {disableAnchor ? null :
      <a
       href={`#${anchor}`}
       className={style['anchor-link']}
       data-anchor-link="">
        <FaLink name="linkify" />
      </a>}
      {children}
    </Tag>
  );

}


type HeadingTagWrapperProps = Omit<HeadingTagProps, 'level'>;

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
