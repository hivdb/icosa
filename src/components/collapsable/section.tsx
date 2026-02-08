import React from 'react';
import {FaPlusCircle} from '@react-icons/all-files/fa/FaPlusCircle';
import {FaMinusCircle} from '@react-icons/all-files/fa/FaMinusCircle';
import Children from 'react-children-utilities';
import {withRouter} from 'found';

import type {SectionInnerProps, SectionProps, SectionElementProps} from './types';
import {getAnchor, HeadingTag} from '../heading-tags';
import Context from './context';
import style from './style.module.scss';

/**
 * Functional replacement for the legacy class based SectionInner component.
 */
export function SectionInner({
  level,
  children,
  match,
  router,
  alwaysCollapsable = false,
  registerCollapsableAnchor = () => {},
  getClosestCollapsableAnchor = () => ({anchor: null, shouldCollapseOther: false}),
  ...props
}: SectionInnerProps) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [, forceUpdate] = React.useState({});

  const onLoad = React.useCallback(() => {
    setTimeout(() => forceUpdate({}), 0);
  }, []);

  const renderedChildren = React.useMemo(
    () => (typeof children === 'function' ? children({onLoad}) : children),
    [children, onLoad]
  );

  const headingChild = React.useMemo(
    () =>
      Children.deepFind(
        renderedChildren,
        child => !!child && React.isValidElement(child) && child.type === HeadingTag
      ),
    [renderedChildren]
  );
  const myAnchor = headingChild && React.isValidElement(headingChild) ? getAnchor(headingChild) : null;

  React.useEffect(() => {
    registerCollapsableAnchor(myAnchor, `h${level}`, alwaysCollapsable);
  }, [myAnchor, level, alwaysCollapsable, registerCollapsableAnchor]);

  const getCurAnchor = React.useCallback(() => {
    let curHash: string | null = match?.location?.hash || null;
    if (curHash) {
      curHash = curHash.replace(/^#/, '');
    }
    return getClosestCollapsableAnchor(curHash);
  }, [match, getClosestCollapsableAnchor]);

  const initial = getCurAnchor();
  const [expanded, setExpanded] = React.useState(
    myAnchor !== null && myAnchor === initial.anchor
  );

  React.useEffect(() => {
    const {anchor: curAnchor, shouldCollapseOther} = getCurAnchor();
    if (shouldCollapseOther || curAnchor === myAnchor) {
      setExpanded(myAnchor !== null && myAnchor === curAnchor);
    }
  }, [getCurAnchor, myAnchor]);

  const toggleDisplay = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    setExpanded(prev => !prev);
  }, []);

  const minHeight = expanded && sectionRef.current ? sectionRef.current.scrollHeight + 20 : undefined;

  const eventProps = {
    onTouchStart: toggleDisplay,
    onTouchEnd: (e: React.TouchEvent) => e.preventDefault(),
    onClick: toggleDisplay
  };

  const sectionProps: SectionElementProps = {
    ...props,
    'data-level': level
  };
  if (expanded) {
    sectionProps['data-expanded'] = '';
    sectionProps.style = {...sectionProps.style, minHeight};
  }

  return (
    <section {...sectionProps} ref={sectionRef}>
      <a
        {...eventProps}
        className={style['toggle-display']}
        href="#toggle-display">
        {expanded ? (
          <FaMinusCircle aria-label="expand" />
        ) : (
          <FaPlusCircle aria-label="collapse" />
        )}
      </a>
      {renderedChildren}
    </section>
  );
}

/**
 * Section component that consumes context and passes to SectionInner.
 * The withRouter HOC will inject match and router props.
 */
function Section(props: SectionInnerProps) {
  const {registerCollapsableAnchor, getClosestCollapsableAnchor} = React.useContext(Context);
  return (
    <SectionInner
      {...props}
      registerCollapsableAnchor={registerCollapsableAnchor}
      getClosestCollapsableAnchor={getClosestCollapsableAnchor}
    />
  );
}

// Type assertion needed because Found's withRouter types don't align perfectly with our props
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default withRouter(Section as any) as React.ComponentType<SectionProps>;
