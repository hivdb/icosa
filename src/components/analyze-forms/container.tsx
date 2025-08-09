import React from 'react';
import classNames from 'classnames';

import style from './style.module.scss';

/** Props for {@link AnalyzeFormsContainer}. */
export interface AnalyzeFormsContainerProps {
  /** Name of the currently active tab. */
  tabName: string;
  /** Optional additional CSS class. */
  className?: string;
  /** Inner content of the container. */
  children?: React.ReactNode;
}

/**
 * Wrapper element providing a section with `data-tabname` attribute used by
 * analyze forms layout.
 *
 * @param props - {@link AnalyzeFormsContainerProps} configuration.
 * @returns Section element wrapping provided children.
 */
export default function AnalyzeFormsContainer({
  className,
  children,
  tabName
}: AnalyzeFormsContainerProps): React.JSX.Element {
  return (
    <section
     data-tabname={tabName}
     className={classNames(style['analyze-form-tabs'], className)}>
      {children}
    </section>
  );
}

