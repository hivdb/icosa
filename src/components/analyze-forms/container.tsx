import React from 'react';
import classNames from 'classnames';

import type {AnalyzeFormsContainerProps} from './types';
import style from './style.module.scss';

export type {AnalyzeFormsContainerProps};


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

