import React from 'react';
import makeClassNames from 'classnames';

import Context, {CollapsableContextValue} from './context';
import Section from './section';
import style from './style.module.scss';

interface Props {
  levels?: ('h2' | 'h3' | 'h4' | 'h5' | 'h6')[];
  children?: React.ReactNode;
}

/**
 * Provide collapsable behaviour for nested sections based on heading levels.
 */
function Collapsable({levels = ['h3'], children}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const collapsableContext = React.useMemo(
    () => new CollapsableContextValue(containerRef as React.RefObject<HTMLDivElement>, levels),
    [containerRef, levels]
  );
  const classNames = React.useMemo(
    () => makeClassNames(
      style.collapsable,
      ...levels.map(level => style[`collapse-${level}`])
    ),
    [levels]
  );
  return (
    <Context.Provider value={collapsableContext}>
      <div ref={containerRef} className={classNames}>
        {children}
      </div>
    </Context.Provider>
  );
}

Collapsable.Section = Section;

export default Collapsable;
