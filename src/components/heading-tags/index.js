import PropTypes from 'prop-types';
import React from 'react';
import {FaLink} from '@react-icons/all-files/fa/FaLink';
import Children from 'react-children-utilities';

import style from './style.module.scss';


export function getChildrenText(elem) {
  return Children.onlyText(elem);
}


export function getAnchor(elem) {
  if (elem.type === HeadingTag) {
    elem = elem.props.children;
  }
  return getChildrenText(elem)
    .toLowerCase()
    .replace(/[^\w-]+/g, '.');
}

HeadingTag.propTypes = {
  id: PropTypes.string,
  level: PropTypes.oneOf([1, 2, 3, 4, 5, 6]).isRequired,
  children: PropTypes.node.isRequired,
  disableAnchor: PropTypes.bool.isRequired
};

HeadingTag.defaultProps = {
  disableAnchor: false
};

export function HeadingTag({id, level, children, disableAnchor, ...props}) {

  const elemRef = React.useRef();

  const anchor = React.useMemo(
    () => id ? id : getAnchor(children),
    [id, children]
  );

  React.useEffect(
    () => {
      if (anchor !== '' && window.location.hash.replace(/^#/, '') === anchor) {
        setTimeout(() => {
          const top = (
            elemRef.current.getBoundingClientRect().top + window.pageYOffset
          );
          window.scrollTo(0, top);
        });
      }
    },
    [anchor]
  );

  const Tag = `h${level}`;
  return (
    <Tag
     {...props}
     ref={elemRef}
     className={style['heading-tag']}
     id={anchor}>
      {disableAnchor ? null :
      <a
       href={`#${this.anchor}`}
       className={style['anchor-link']}
       data-anchor-link="">
        <FaLink name="linkify" />
      </a>}
      {children}
    </Tag>
  );

}


export function H1(props) {
  return <HeadingTag {...props} level={1} />;
}

export function H2(props) {
  return <HeadingTag {...props} level={2} />;
}

export function H3(props) {
  return <HeadingTag {...props} level={3} />;
}

export function H4(props) {
  return <HeadingTag {...props} level={4} />;
}

export function H5(props) {
  return <HeadingTag {...props} level={5} />;
}

export function H6(props) {
  return <HeadingTag {...props} level={6} />;
}
